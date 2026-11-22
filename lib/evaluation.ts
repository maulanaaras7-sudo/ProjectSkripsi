import { createHash } from "node:crypto";
import { rows } from "@/lib/db";
import type { QuestionRow } from "@/lib/types";

const subtopics = [
  "konsep_dasar_fungsi", "operasi_aljabar_fungsi", "notasi_konsep_komposisi",
  "komposisi_dua_atau_lebih", "sifat_komposisi", "konsep_syarat_fungsi_invers",
  "menentukan_fungsi_invers", "hubungan_fungsi_komposisi_invers", "permasalahan_kontekstual",
] as const;
const excluded = {
  rendah: new Set(["permasalahan_kontekstual"]),
  sedang: new Set<string>(),
  tinggi: new Set(["notasi_konsep_komposisi"]),
};

export async function evaluationQuestions(userId: number, kind: "pretest" | "posttest") {
  const bank = await rows<QuestionRow[]>("SELECT * FROM soal WHERE jenis=? AND aktif=1 ORDER BY id", [kind]);
  const selected = (["rendah", "sedang", "tinggi"] as const).flatMap((level) =>
    subtopics.filter((subtopic) => !excluded[level].has(subtopic)).flatMap((subtopic) =>
      bank.filter((q) => q.tingkat_kesulitan === level && q.sub_materi === subtopic)
        .sort((a, b) => rank(`${userId}:${kind}:${level}:${subtopic}:${a.id}`).localeCompare(rank(`${userId}:${kind}:${level}:${subtopic}:${b.id}`)))
        .slice(0, 1),
    ),
  );
  return selected
    .sort((a, b) => rank(`order:${userId}:${kind}:${a.id}`).localeCompare(rank(`order:${userId}:${kind}:${b.id}`)))
    .map((question) => ({
      ...question,
      _option_order: (["a", "b", "c", "d", "e"] as const)
        .filter((key) => Boolean(question[`pilihan_${key}`]))
        .sort((a, b) => rank(`option:${userId}:${kind}:${question.id}:${a}`).localeCompare(rank(`option:${userId}:${kind}:${question.id}:${b}`))),
    }));
}

function rank(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
