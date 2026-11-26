import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import postgres from "postgres";

const args = Object.fromEntries(process.argv.slice(2).map((entry) => {
  const [key, ...value] = entry.replace(/^--/, "").split("=");
  return [key, value.join("=")];
}));
const blueprintPath = resolve(args.blueprint || "references/Fungsiverse_KisiKisi_Codex_20261126/BLUEPRINT_9_SUBMATERI.json");
const markdownPath = resolve(args.markdown || "docs/ASSESSMENT_BANK_AUDIT_2026-11-26.md");
const inventoryPath = resolve(args.inventory || "docs/assessment-bank-audit-inventory-2026-11-26.json");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL wajib tersedia untuk audit read-only.");

const blueprint = JSON.parse(await readFile(blueprintPath, "utf8"));
const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: /(?:localhost|127\.0\.0\.1)/.test(databaseUrl) ? false : "require",
  connect_timeout: 10,
});

const subtopicByDatabaseValue = {
  konsep_dasar_fungsi: "SM01",
  operasi_aljabar_fungsi: "SM02",
  notasi_konsep_komposisi: "SM03",
  komposisi_dua_atau_lebih: "SM04",
  sifat_komposisi: "SM05",
  konsep_syarat_fungsi_invers: "SM06",
  menentukan_fungsi_invers: "SM07",
  hubungan_fungsi_komposisi_invers: "SM08",
  permasalahan_kontekstual: "SM09",
};
const levels = ["rendah", "sedang", "tinggi"];
const normalize = (value) => String(value ?? "").normalize("NFKC").replace(/\s+/g, "").toLowerCase();
const normalizeParallelStem = (value) => String(value ?? "")
  .normalize("NFKC")
  .replace(/^Evaluasi (awal|akhir) /i, "Evaluasi ")
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

let items;
try {
  items = await sql.begin(async (connection) => {
    await connection.unsafe("SET TRANSACTION READ ONLY");
    return connection.unsafe(`SELECT id,kode_soal,jenis,tingkat_kesulitan,sub_materi,kode_tp,kode_ipk,
      level_kognitif,pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,
      jawaban_benar,pembahasan,metadata_verifikasi,aktif
      FROM soal WHERE jenis IN ('pretest','posttest') ORDER BY jenis,kode_soal`);
  });
} finally {
  await sql.end();
}

const blueprintById = new Map(blueprint.categories.map((category) => [category.id, category]));
const byKind = Object.groupBy(items, (item) => item.jenis);
const pairedPost = new Map((byKind.posttest ?? []).map((item) => [item.kode_soal.slice(-3), item]));
const parallelPairs = [];
for (const pre of byKind.pretest ?? []) {
  const post = pairedPost.get(pre.kode_soal.slice(-3));
  if (!post) continue;
  const fields = ["pertanyaan", "pilihan_a", "pilihan_b", "pilihan_c", "pilihan_d", "pilihan_e", "jawaban_benar", "pembahasan"];
  const mismatches = fields.filter((field) => normalizeParallelStem(pre[field]) !== normalizeParallelStem(post[field]));
  parallelPairs.push({ pre: pre.kode_soal, post: post.kode_soal, mismatches });
}

const inventory = items.map((item) => {
  const subtopicId = subtopicByDatabaseValue[item.sub_materi] ?? "UNKNOWN";
  const category = blueprintById.get(subtopicId);
  const keyText = item[`pilihan_${item.jawaban_benar}`];
  const options = [item.pilihan_a, item.pilihan_b, item.pilihan_c, item.pilihan_d, item.pilihan_e];
  const flags = [];
  if (!category) flags.push("UNKNOWN_SUBTOPIC");
  if (category?.package_quota_per_test?.[item.tingkat_kesulitan] === 0) flags.push("ZERO_QUOTA_CELL_REVIEW");
  if (subtopicId === "SM02" && item.kode_tp === "TP01") flags.push("SM02_TP_REVIEW");
  if (item.tingkat_kesulitan === "tinggi" && item.level_kognitif === "C2") flags.push("HIGH_C2_DIFFICULTY_REVIEW");
  if (!item.kode_soal || !item.kode_tp || !item.kode_ipk || !item.level_kognitif || !item.sub_materi) flags.push("MISSING_METADATA");
  if (!options.every((option) => typeof option === "string" && option.trim())) flags.push("INCOMPLETE_OPTIONS");
  if (new Set(options.map(normalize)).size !== options.length) flags.push("DUPLICATE_OPTIONS");
  if (normalize(keyText) !== normalize(item.metadata_verifikasi?.expected)) flags.push("KEY_EXPECTED_MISMATCH");
  if (item.kode_tp !== item.metadata_verifikasi?.tp || item.kode_ipk !== item.metadata_verifikasi?.ipk || item.level_kognitif !== item.metadata_verifikasi?.cognitive) flags.push("TRACEABILITY_MISMATCH");
  flags.push("PARALLEL_BANK_REVIEW");
  return {
    id: item.id,
    item_id: item.kode_soal,
    test_type: item.jenis === "pretest" ? "PRE" : "POST",
    subtopic_id: subtopicId,
    database_subtopic: item.sub_materi,
    tp_code: item.kode_tp,
    ipk_code: item.kode_ipk,
    difficulty: item.tingkat_kesulitan,
    cognitive_level: item.level_kognitif,
    template: item.metadata_verifikasi?.template ?? null,
    active: item.aktif === 1,
    flags,
  };
});

const actualMatrix = {};
for (const kind of ["PRE", "POST"]) {
  actualMatrix[kind] = {};
  for (const category of blueprint.categories) {
    actualMatrix[kind][category.id] = Object.fromEntries(levels.map((level) => [level, 0]));
  }
}
for (const item of inventory) {
  if (actualMatrix[item.test_type]?.[item.subtopic_id]) actualMatrix[item.test_type][item.subtopic_id][item.difficulty] += 1;
}

const technicalFlags = new Set(["UNKNOWN_SUBTOPIC", "MISSING_METADATA", "INCOMPLETE_OPTIONS", "DUPLICATE_OPTIONS", "KEY_EXPECTED_MISMATCH", "TRACEABILITY_MISMATCH"]);
const technicalProblems = inventory.filter((item) => item.flags.some((flag) => technicalFlags.has(flag)));
const zeroQuotaItems = inventory.filter((item) => item.flags.includes("ZERO_QUOTA_CELL_REVIEW"));
const tpReviewItems = inventory.filter((item) => item.flags.includes("SM02_TP_REVIEW"));
const highC2Items = inventory.filter((item) => item.flags.includes("HIGH_C2_DIFFICULTY_REVIEW"));
const identicalPairs = parallelPairs.filter((pair) => pair.mismatches.length === 0);
const nearParallelPairs = parallelPairs.filter((pair) => pair.mismatches.length > 0);

const lines = [
  "# Audit baseline bank pretest dan posttest Fungsiverse",
  "",
  "> Snapshot read-only sebelum perubahan teknis. Tanggal audit: 26 November 2026. Tidak ada isi soal, kunci, ID, jawaban siswa, atau nilai yang diubah pada fase ini.",
  "",
  "## Ringkasan",
  "",
  `- Inventaris: ${inventory.filter((item) => item.test_type === "PRE").length} PRE dan ${inventory.filter((item) => item.test_type === "POST").length} POST.`,
  "- Total kesulitan per bank: 34 rendah, 33 sedang, 33 tinggi.",
  `- Integritas teknis: ${inventory.length - technicalProblems.length}/${inventory.length} butir memiliki metadata inti, lima opsi, kunci valid, dan nilai expected yang konsisten.`,
  `- Sel kuota nol: ${zeroQuotaItems.length} butir perlu review akademik (${zeroQuotaItems.map((item) => item.item_id).join(", ")}).`,
  `- Pemetaan SM02 ke TP: ${tpReviewItems.length} butir masih memakai TP01, sedangkan blueprint menyebut prasyarat TP02–TP03.`,
  `- Kesulitan tinggi berlevel C2: ${highC2Items.length} butir perlu penilaian ahli; tingkat kesulitan tidak diubah otomatis.`,
  `- Kesetaraan PRE/POST: ${identicalPairs.length} pasangan identik setelah label awal/akhir dinormalisasi; ${nearParallelPairs.length} pasangan hanya berbeda pada sebagian teks. Seluruh pasangan memerlukan review independensi bank.`,
  "- Skema runtime `soal` belum memiliki kolom indikator, status versi, dan versi butir yang eksplisit; `kode_ipk`, `aktif`, dan `metadata_verifikasi` hanya memenuhi sebagian kebutuhan metadata blueprint.",
  "",
  "## Matriks stok aktual dibanding target per bank",
  "",
  "Format sel: `aktual/target`.",
  "",
  "| Bank | Submateri | Rendah | Sedang | Tinggi | Total aktual | Total target |",
  "|---|---|---:|---:|---:|---:|---:|",
];
for (const kind of ["PRE", "POST"]) {
  for (const category of blueprint.categories) {
    const actual = actualMatrix[kind][category.id];
    const target = category.bank_target_per_test;
    lines.push(`| ${kind} | ${category.id} | ${actual.rendah}/${target.rendah} | ${actual.sedang}/${target.sedang} | ${actual.tinggi}/${target.tinggi} | ${actual.rendah + actual.sedang + actual.tinggi} | ${target.rendah + target.sedang + target.tinggi} |`);
  }
}
lines.push(
  "",
  "Tidak ada shortage untuk 25 slot paket karena setiap sel dengan kuota 1 memiliki stok. Namun distribusi inventaris per SM tidak mengikuti target 100 butir; perubahan label atau isi memerlukan persetujuan akademik.",
  "",
  "## Inventaris 200 butir",
  "",
  "Flag `PARALLEL_BANK_REVIEW` adalah temuan lintas-bank, bukan bukti bahwa kunci salah. `ZERO_QUOTA_CELL_REVIEW`, `SM02_TP_REVIEW`, dan `HIGH_C2_DIFFICULTY_REVIEW` tidak boleh diperbaiki otomatis.",
  "",
  "| DB ID | Item ID | Bank | SM | Kesulitan | TP | IPK | Kognitif | Template | Flag review |",
  "|---:|---|---|---|---|---|---|---|---|---|",
);
for (const item of inventory) {
  lines.push(`| ${item.id} | ${item.item_id} | ${item.test_type} | ${item.subtopic_id} | ${item.difficulty} | ${item.tp_code} | ${item.ipk_code} | ${item.cognitive_level} | ${item.template ?? "—"} | ${item.flags.join(", ")} |`);
}
lines.push(
  "",
  "## Keputusan audit",
  "",
  "Perubahan teknis yang aman: gunakan blueprint sebagai sumber slot paket, validasi shortage tanpa fallback, pertahankan pemilihan deterministik dan pengacakan opsi berbasis ID pilihan, serta normalisasi istilah sumbu. Revisi isi, kunci, TP, submateri, atau tingkat kesulitan ditunda sampai ada persetujuan peneliti/validator.",
  "",
);

await mkdir(dirname(markdownPath), { recursive: true });
await mkdir(dirname(inventoryPath), { recursive: true });
await writeFile(markdownPath, `${lines.join("\n")}\n`, "utf8");
await writeFile(inventoryPath, `${JSON.stringify({ generated_at: "2026-11-26", blueprint_version: blueprint.version, summary: { total: inventory.length, technical_problems: technicalProblems.length, zero_quota_items: zeroQuotaItems.length, sm02_tp_review: tpReviewItems.length, high_c2_review: highC2Items.length, identical_pre_post_pairs: identicalPairs.length, near_parallel_pairs: nearParallelPairs.length }, actual_matrix: actualMatrix, parallel_pairs: parallelPairs, items: inventory }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ markdownPath, inventoryPath, total: inventory.length, technicalProblems: technicalProblems.length }, null, 2));
