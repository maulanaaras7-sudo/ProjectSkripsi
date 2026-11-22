import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("database/sql/seed_question_bank_aligned.sql");
const target = resolve("database/neon/02_seed_questions.sql");
const columns = [
  "kode_soal", "materi_id", "jenis", "tingkat_kesulitan", "sub_materi",
  "capaian_pembelajaran", "tujuan_pembelajaran", "kode_tp", "kode_ipk",
  "level_kognitif", "pertanyaan", "pilihan_a", "pilihan_b", "pilihan_c",
  "pilihan_d", "pilihan_e", "jawaban_benar", "pembahasan",
  "metadata_verifikasi", "aktif",
];

let sql = await readFile(source, "utf8");
sql = sql.replace(/^REPLACE INTO `soal` VALUES /, "INSERT INTO soal VALUES ");
sql = sql.replaceAll('\\"', '"');
const marker = ";\n-- LEGACY ONLY";
if (!sql.includes(marker)) throw new Error("Format seed sumber tidak dikenali.");
sql = sql.replace(marker, `\nON CONFLICT (id) DO UPDATE SET\n${columns.map((column) => `  ${column}=EXCLUDED.${column}`).join(",\n")};\n-- Converted from the validated aligned question bank.\n-- LEGACY ONLY`);
await writeFile(target, `-- Generated PostgreSQL seed for Neon.\nBEGIN;\n${sql.trim()}\nCOMMIT;\n`, "utf8");
console.log(`Created ${target}`);
