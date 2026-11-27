import { NextRequest, NextResponse, after } from "next/server";
import { makeBratSticker, makeBratPng, imageToSticker } from "@/lib/sticker";
import { sendText, sendSticker, sendVideo, uploadMedia, downloadMedia } from "@/lib/whatsapp";
import { makeVideo } from "@/lib/video";
import { textToSpeech } from "@/lib/tts";

export const maxDuration = 60;

// Verifikasi webhook saat didaftarkan di Meta
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(p.get("hub.challenge"), { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  // Balas 200 dulu, proses sisanya di belakang layar
  after(async () => {
    if (!msg) return;
    const from: string = msg.from;

    try {
      if (msg.type === "text") {
        const text: string = msg.text.body.trim();
        if (!text || text.length > 120) {
          return await sendText(from, "Kirim teks maksimal 120 karakter.");
        }

        // Teks -> gambar brat + suara -> video
        const [png, audio] = await Promise.all([makeBratPng(text), textToSpeech(text)]);
        const video = await makeVideo(png, audio, "mp3");
        const id = await uploadMedia(video, "video/mp4", "brat.mp4");
        await sendVideo(from, id);
      } else if (msg.type === "image") {
        // Gambar kiriman -> stiker
        const original = await downloadMedia(msg.image.id);
        const webp = await imageToSticker(original);
        const id = await uploadMedia(webp, "image/webp", "sticker.webp");
        await sendSticker(from, id);
      } else {
        await sendText(from, "Kirim teks atau gambar, nanti saya buatkan stikernya atau videonya.");
      }
    } catch (err) {
      console.error(err);
      await sendText(from, "Maaf, terjadi kesalahan. Coba lagi sebentar.");
    }
  });

  return NextResponse.json({ status: "ok" });
}
