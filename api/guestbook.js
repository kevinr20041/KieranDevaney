const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Raw, trimmed text is stored as-is; the client escapes on render (textContent),
// so there is exactly one place responsible for preventing XSS, not two.
module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const entries = await sql`
        SELECT id, name, message, created_at
        FROM guestbook_entries
        ORDER BY created_at DESC
        LIMIT 200
      `;
      res.status(200).json({ entries });
    } catch (err) {
      res.status(500).json({ error: 'Could not load guestbook entries.' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { name, message, website } = body;

      // Honeypot field: real visitors never fill this in.
      if (website) {
        res.status(201).json({ ok: true });
        return;
      }

      const cleanName = typeof name === 'string' ? name.trim().slice(0, 60) : '';
      const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 500) : '';

      if (!cleanName || !cleanMessage) {
        res.status(400).json({ error: 'Name and message are required.' });
        return;
      }

      const [entry] = await sql`
        INSERT INTO guestbook_entries (name, message)
        VALUES (${cleanName}, ${cleanMessage})
        RETURNING id, name, message, created_at
      `;

      res.status(201).json({ entry });
    } catch (err) {
      res.status(500).json({ error: 'Could not save your message.' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
