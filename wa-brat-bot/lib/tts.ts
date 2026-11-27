// Teks -> audio MP3 (OpenAI TTS). Ganti dengan layanan lain jika perlu.
export async function textToSpeech(text: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
    }),
  });
  if (!res.ok) throw new Error("TTS gagal: " + (await res.text()));
  return Buffer.from(await res.arrayBuffer());
}
