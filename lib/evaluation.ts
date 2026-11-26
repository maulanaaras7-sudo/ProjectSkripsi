import { rows } from "@/lib/db";
import { selectEvaluationPackage } from "@/lib/evaluation-selection";
import type { QuestionRow } from "@/lib/types";

export async function evaluationQuestions(userId: number, kind: "pretest" | "posttest") {
  const bank = await rows<QuestionRow[]>("SELECT * FROM soal WHERE jenis=? AND aktif=1 ORDER BY id", [kind]);
  return selectEvaluationPackage(bank, userId, kind);
}
