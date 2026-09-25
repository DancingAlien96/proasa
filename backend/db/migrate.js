import { readFile } from 'node:fs/promises';
import pg from 'pg';

const withSeed = process.argv.includes('--seed');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

const run = async (file) => {
  const sql = await readFile(new URL(file, import.meta.url), 'utf8');
  await client.query(sql);
  console.log(`✔ ${file}`);
};

try {
  await client.connect();
  await run('./schema.sql');
  if (withSeed) await run('./seed.sql');
} catch (err) {
  console.error('Error en la migración:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
