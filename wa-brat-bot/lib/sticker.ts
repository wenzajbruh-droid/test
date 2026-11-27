import sharp from "sharp";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Bungkus teks ke beberapa baris
function wrap(text: string, maxChars = 12): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 8);
}

// Teks -> gambar gaya "brat" (latar hijau lime, teks hitam, huruf kecil)
export async function makeBratSticker(text: string): Promise<Buffer> {
  const lines = wrap(text.toLowerCase());
  const tspans = lines
    .map(
      (l, i) =>
        `<text x="24" y="${80 + i * 66}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="60" fill="#000">${esc(l)}</text>`
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
    <rect width="512" height="512" fill="#8ACE00"/>${tspans}
  </svg>`;

  return sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
}

// Teks -> PNG (dipakai untuk video, FFmpeg tidak membaca WebP)
export async function makeBratPng(text: string): Promise<Buffer> {
  const webp = await makeBratSticker(text);
  return sharp(webp).png().toBuffer();
}

// Gambar apa pun -> stiker WebP 512x512 dengan latar transparan
export async function imageToSticker(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 80 })
    .toBuffer();
}
