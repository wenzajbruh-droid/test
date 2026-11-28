// Fungsi server: kunci Gemini hanya ada di env GEMINI_API_KEY, tidak pernah sampai ke browser.
// shortcut: belum ada batas pemakaian per pengunjung, tambahkan rate limit kalau dibuka umum
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Kunci GEMINI_API_KEY belum diatur di Vercel.' });
  const prompt = String((req.body && req.body.prompt) || '').trim();
  if (!prompt) return res.status(400).json({ error: 'Tulis dulu permintaannya.' });
  if (prompt.length > 2000) return res.status(400).json({ error: 'Maksimal 2000 karakter.' });
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: (data.error && data.error.message) || 'Gemini menolak permintaan.' });
    const text = (data.candidates && data.candidates[0] && data.candidates[0].content.parts.map(p => p.text).join('')) || '';
    return res.status(200).json({ text: text || '(kosong)' });
  } catch (e) {
    return res.status(502).json({ error: 'Tidak bisa menghubungi Gemini.' });
  }
};
