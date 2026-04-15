// Run DB migration against Supabase via the Management API.
// Usage:
//   SUPABASE_ACCESS_TOKEN=your_pat node scripts/migrate.js
//
// Get a token: supabase.com → avatar → Access Tokens → Generate new token

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const PROJECT_REF   = 'jttvcfyyrlnjjvrxiith';
const ACCESS_TOKEN  = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('Error: SUPABASE_ACCESS_TOKEN is not set.');
  console.error('Get one from supabase.com → avatar → Access Tokens');
  process.exit(1);
}

const sql = readFileSync(
  join(__dir, '../supabase/migrations/001_initial_schema.sql'),
  'utf8'
);

console.log('Running migration against project:', PROJECT_REF);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  }
);

if (!res.ok) {
  const body = await res.text();
  console.error('Migration failed:', res.status, body);
  process.exit(1);
}

console.log('Migration complete. Tables and trigger are live.');
