const { normalizeData, writeAppData } = require('./_lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const nextData = normalizeData(payload);
    const saved = await writeAppData(nextData);
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to save data' });
  }
};
