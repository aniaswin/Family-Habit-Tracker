const { readAppData, writeAppData } = require('./_lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { memberId, habitId, date } = payload;
    if (!memberId || !habitId || !date) {
      res.status(400).json({ error: 'memberId, habitId, and date are required' });
      return;
    }

    const data = await readAppData();
    const key = `${memberId}:${habitId}:${date}`;
    if (data.completions[key]) {
      delete data.completions[key];
    } else {
      data.completions[key] = true;
    }

    const saved = await writeAppData(data);
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to toggle completion' });
  }
};
