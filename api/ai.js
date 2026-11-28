// Fungsi server: kunci OpenRouter hanya ada di env OPENROUTER_API_KEY, tidak pernah sampai ke browser.
// shortcut: belum ada batas pemakaian per pengunjung, tambahkan rate limit kalau dibuka umum
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST.' });
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return res.status(500).json({ error: 'Kunci OPENROUTER_API_KEY belum diatur di Vercel.' });
  const prompt = String((req.body && req.body.prompt) || '').trim();
  if (!prompt) return res.status(400).json({ error: 'Tulis dulu permintaannya.' });
  if (prompt.length > 2000) return res.status(400).json({ error: 'Maksimal 2000 karakter.' });
  const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: (data.error && data.error.message) || 'OpenRouter menolak permintaan.' });
    const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    return res.status(200).json({ text: text || '(kosong)' });
  } catch (e) {
    return res.status(502).json({ error: 'Tidak bisa menghubungi OpenRouter.' });
  }
};
