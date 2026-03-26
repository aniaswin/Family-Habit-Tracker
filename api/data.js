const { readAppData } = require('./_lib/store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const data = await readAppData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load data' });
  }
};
