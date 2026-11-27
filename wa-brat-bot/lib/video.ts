import ffmpegPath from "ffmpeg-static";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const run = promisify(execFile);

// Gambar PNG + audio -> MP4 (layar statis, suara penuh)
export async function makeVideo(imagePng: Buffer, audio: Buffer, audioExt = "mp3"): Promise<Buffer> {
  if (!ffmpegPath) throw new Error("Binary FFmpeg tidak ditemukan");

  const id = Date.now() + "-" + Math.random().toString(36).slice(2);
  const img = join(tmpdir(), `${id}.png`);
  const aud = join(tmpdir(), `${id}.${audioExt}`);
  const out = join(tmpdir(), `${id}.mp4`);

  await writeFile(img, imagePng);
  await writeFile(aud, audio);

  try {
    await run(ffmpegPath, [
      "-y",
      "-loop", "1", "-i", img,
      "-i", aud,
      "-c:v", "libx264", "-tune", "stillimage",
      "-c:a", "aac", "-b:a", "128k",
      "-pix_fmt", "yuv420p",
      "-vf", "scale=512:512",
      "-shortest",
      "-movflags", "+faststart",
      out,
    ]);
    return await readFile(out);
  } finally {
    await Promise.all([img, aud, out].map((p) => unlink(p).catch(() => {})));
  }
}
