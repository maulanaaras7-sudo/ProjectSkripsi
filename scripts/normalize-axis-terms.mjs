import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import postgres from "postgres";

const flags = new Set(process.argv.slice(2));
const valueFlag = (name) => process.argv.slice(2).find((entry) => entry.startsWith(`--${name}=`))?.slice(name.length + 3);
const apply = flags.has("--apply");
const normalizeFiles = flags.has("--normalize-files");
const rollbackPath = valueFlag("rollback");
const backupPath = resolve(valueFlag("backup") || "docs/axis-term-backup-2026-11-26.json");
const pattern = /\bsumbu[-‐‑‒–—−]([xy])\b/giu;
const normalize = (value) => value.replace(pattern, (match, axis) => `${match.startsWith("S") ? "Sumbu" : "sumbu"} ${axis.toLowerCase()}`);
const sourceFiles = [
  "database/sql/seed_question_bank_aligned.sql",
  "database/neon/02_seed_questions.sql",
];
const tables = {
  soal: {
    primaryKey: "id",
    displayKey: "kode_soal",
    fields: ["capaian_pembelajaran", "tujuan_pembelajaran", "pertanyaan", "pilihan_a", "pilihan_b", "pilihan_c", "pilihan_d", "pilihan_e", "pembahasan"],
  },
  materi: { primaryKey: "id", displayKey: "judul", fields: ["judul", "konten"] },
  aktivitas_materi: { primaryKey: "id", displayKey: "judul", fields: ["judul", "deskripsi", "soal_ringkas"] },
  langkah_aktivitas: { primaryKey: "id", displayKey: "id", fields: ["pertanyaan", "pilihan", "jawaban_benar", "feedback_benar", "feedback_salah", "petunjuk"] },
  contoh_soal: { primaryKey: "id", displayKey: "kode_contoh", fields: ["pertanyaan", "pilihan_a", "pilihan_b", "pilihan_c", "pilihan_d", "pilihan_e", "hint_1", "hint_2", "pembahasan"] },
};

if (normalizeFiles) {
  for (const file of sourceFiles) {
    const path = resolve(file);
    const original = await readFile(path, "utf8");
    const updated = normalize(original);
    if (updated !== original) await writeFile(path, updated, "utf8");
    console.log(JSON.stringify({ file, replacements: [...original.matchAll(pattern)].length }));
  }
}

if (!process.env.DATABASE_URL) {
  if (apply || rollbackPath) throw new Error("DATABASE_URL wajib tersedia untuk perubahan database.");
  process.exit(0);
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: /(?:localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL) ? false : "require",
  connect_timeout: 10,
});

try {
  if (rollbackPath) {
    const backup = JSON.parse(await readFile(resolve(rollbackPath), "utf8"));
    await sql.begin(async (connection) => {
      for (const change of backup.changes) {
        const config = tables[change.table];
        if (!config || !config.fields.includes(change.field)) throw new Error(`Target rollback tidak diizinkan: ${change.table}.${change.field}`);
        await connection.unsafe(
          `UPDATE ${change.table} SET ${change.field}=$1 WHERE ${config.primaryKey}=$2 AND ${change.field}=$3`,
          [change.before, change.primaryKey, change.after],
        );
      }
    });
    console.log(JSON.stringify({ rolledBack: backup.changes.length, source: resolve(rollbackPath) }, null, 2));
    process.exit(0);
  }

  const changes = await sql.begin(async (connection) => {
    await connection.unsafe("SET TRANSACTION READ ONLY");
    const output = [];
    for (const [table, config] of Object.entries(tables)) {
      const rows = await connection.unsafe(`SELECT ${config.primaryKey},${config.displayKey},${config.fields.join(",")} FROM ${table}`);
      for (const row of rows) {
        for (const field of config.fields) {
          if (typeof row[field] !== "string") continue;
          const after = normalize(row[field]);
          if (after !== row[field]) output.push({ table, primaryKey: row[config.primaryKey], displayKey: String(row[config.displayKey]), field, before: row[field], after });
        }
      }
    }
    return output;
  });

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", changes: changes.length, byTable: Object.groupBy(changes, (change) => change.table) }, null, 2));
  if (!apply || !changes.length) process.exit(0);

  await mkdir(dirname(backupPath), { recursive: true });
  await writeFile(backupPath, `${JSON.stringify({ created_at: new Date().toISOString(), purpose: "Rollback normalisasi istilah sumbu-x/y", changes }, null, 2)}\n`, "utf8");
  await sql.begin(async (connection) => {
    for (const change of changes) {
      const config = tables[change.table];
      await connection.unsafe(
        `UPDATE ${change.table} SET ${change.field}=$1 WHERE ${config.primaryKey}=$2 AND ${change.field}=$3`,
        [change.after, change.primaryKey, change.before],
      );
    }
  });
  console.log(JSON.stringify({ applied: changes.length, backupPath }, null, 2));
} finally {
  await sql.end();
}

