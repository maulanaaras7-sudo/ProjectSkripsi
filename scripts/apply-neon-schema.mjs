import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import postgres from "postgres";

function parseEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const localEnv = parseEnv(await readFile(resolve(".env.local"), "utf8"));
const connectionString = process.env.DATABASE_URL_UNPOOLED ?? localEnv.DATABASE_URL_UNPOOLED;
if (!connectionString) throw new Error("DATABASE_URL_UNPOOLED tidak ditemukan di .env.local.");

const sql = postgres(connectionString, { max: 1, prepare: false });
const files = [
  "database/neon/01_schema.sql",
  "database/neon/02_seed_questions.sql",
  "database/neon/03_seed_activities.sql",
  "database/neon/04_finalize.sql",
  "database/neon/05_parity_schema.sql",
  "database/neon/06_seed_examples.sql",
];

try {
  for (const file of files) {
    await sql.file(resolve(file), [], { simple: true });
    console.log(`Applied ${file}`);
  }
} finally {
  await sql.end({ timeout: 5 });
}
