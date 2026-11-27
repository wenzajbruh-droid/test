const API = "https://graph.facebook.com/v21.0";
const TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

async function send(payload: Record<string, unknown>) {
  const res = await fetch(`${API}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  if (!res.ok) console.error("Gagal kirim:", await res.text());
}

export const sendText = (to: string, body: string) =>
  send({ to, type: "text", text: { body } });

export const sendSticker = (to: string, id: string) =>
  send({ to, type: "sticker", sticker: { id } });

export const sendVideo = (to: string, id: string, caption?: string) =>
  send({ to, type: "video", video: { id, caption } });

export async function uploadMedia(buf: Buffer, mime: string, filename: string): Promise<string> {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", mime);
  form.append("file", new Blob([new Uint8Array(buf)], { type: mime }), filename);

  const res = await fetch(`${API}/${PHONE_ID}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error("Upload gagal: " + JSON.stringify(json));
  return json.id as string;
}

// Unduh media yang dikirim pengguna
export async function downloadMedia(mediaId: string): Promise<Buffer> {
  const meta = await fetch(`${API}/${mediaId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  }).then((r) => r.json());

  const file = await fetch(meta.url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return Buffer.from(await file.arrayBuffer());
}
