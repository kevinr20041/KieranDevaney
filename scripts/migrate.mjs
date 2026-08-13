import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS guestbook_entries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS site_counters (
    key TEXT PRIMARY KEY,
    value BIGINT NOT NULL DEFAULT 0
  )
`;

await sql`
  INSERT INTO site_counters (key, value) VALUES ('total_visits', 0)
  ON CONFLICT (key) DO NOTHING
`;

console.log('Migration complete: guestbook_entries + site_counters tables ready.');
