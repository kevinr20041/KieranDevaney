const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const [row] = await sql`
        UPDATE site_counters
        SET value = value + 1
        WHERE key = 'total_visits'
        RETURNING value
      `;
      res.status(200).json({ count: row ? Number(row.value) : 0 });
    } catch (err) {
      res.status(500).json({ error: 'Could not update visitor count.' });
    }
    return;
  }

  if (req.method === 'GET') {
    try {
      const [row] = await sql`
        SELECT value FROM site_counters WHERE key = 'total_visits'
      `;
      res.status(200).json({ count: row ? Number(row.value) : 0 });
    } catch (err) {
      res.status(500).json({ error: 'Could not load visitor count.' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
