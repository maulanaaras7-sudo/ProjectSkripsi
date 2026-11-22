import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// The validated MySQL dump is the canonical source for the example-question
// bank used by the PHP application. This preserves the exact records rather
// than recreating them manually in the Next.js project.
const source = resolve("C:/xampps/htdocs/fungsiversedock/backups/fungsiverse_before_proposal_alignment_20261118.sql");
const target = resolve("database/neon/06_seed_examples.sql");
const dump = await readFile(source, "utf8");
const match = dump.match(/INSERT INTO `contoh_soal` VALUES ([\s\S]*?);\r?\n\/\*!40000 ALTER TABLE `contoh_soal` ENABLE KEYS/);
if (!match) throw new Error("Bagian contoh_soal pada dump PHP tidak ditemukan.");

const columns = "id,kode_contoh,tingkat,urutan,sub_materi,capaian_pembelajaran,tujuan_pembelajaran,pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,hint_1,hint_2,pembahasan,feedback_salah,metadata_verifikasi,aktif";
// mysqldump escapes JSON quotes as \"; PostgreSQL JSONB expects the literal
// quote after the surrounding SQL string has been parsed.
const values = match[1].replaceAll('\\"', '"');
const sql = `-- Generated from the PHP reference database dump. Do not edit manually.\nBEGIN;\nINSERT INTO contoh_soal (${columns}) VALUES ${values}\nON CONFLICT (id) DO UPDATE SET\n  kode_contoh=EXCLUDED.kode_contoh,tingkat=EXCLUDED.tingkat,urutan=EXCLUDED.urutan,sub_materi=EXCLUDED.sub_materi,capaian_pembelajaran=EXCLUDED.capaian_pembelajaran,tujuan_pembelajaran=EXCLUDED.tujuan_pembelajaran,pertanyaan=EXCLUDED.pertanyaan,pilihan_a=EXCLUDED.pilihan_a,pilihan_b=EXCLUDED.pilihan_b,pilihan_c=EXCLUDED.pilihan_c,pilihan_d=EXCLUDED.pilihan_d,pilihan_e=EXCLUDED.pilihan_e,jawaban_benar=EXCLUDED.jawaban_benar,hint_1=EXCLUDED.hint_1,hint_2=EXCLUDED.hint_2,pembahasan=EXCLUDED.pembahasan,feedback_salah=EXCLUDED.feedback_salah,metadata_verifikasi=EXCLUDED.metadata_verifikasi,aktif=EXCLUDED.aktif;\nSELECT setval(pg_get_serial_sequence('contoh_soal','id'),COALESCE((SELECT MAX(id) FROM contoh_soal),1),true);\nCOMMIT;\n`;
await writeFile(target, sql, "utf8");
console.log(`Created ${target}`);
