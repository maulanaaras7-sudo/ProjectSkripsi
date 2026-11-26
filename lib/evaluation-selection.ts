import { createHash } from "node:crypto";
import { ASSESSMENT_BLUEPRINT, ASSESSMENT_SLOTS, difficultyLevels, type EvaluationKind } from "./assessment-blueprint.ts";
import type { QuestionRow } from "./types.ts";

export type EvaluationQuestion = QuestionRow & { _option_order: Array<"a" | "b" | "c" | "d" | "e"> };
export type MissingAssessmentSlot = { subtopicId: string; databaseSubtopic: string; difficulty: string; required: number; available: number };

export class EvaluationBlueprintError extends Error {
  readonly code = "ASSESSMENT_BLUEPRINT_UNAVAILABLE";
  readonly kind: EvaluationKind;
  readonly missingSlots: MissingAssessmentSlot[];
  constructor(kind: EvaluationKind, missingSlots: MissingAssessmentSlot[]) {
    super(`Bank ${kind} tidak memenuhi ${missingSlots.length} slot blueprint.`);
    this.name = "EvaluationBlueprintError";
    this.kind = kind;
    this.missingSlots = missingSlots;
  }
}

function rank(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function selectEvaluationPackage(bank: QuestionRow[], userId: number, kind: EvaluationKind): EvaluationQuestion[] {
  const isolatedBank = bank.filter((question) => question.jenis === kind);
  const missingSlots: MissingAssessmentSlot[] = [];
  const selected = ASSESSMENT_SLOTS.flatMap((slot) => {
    const candidates = isolatedBank
      .filter((question) => question.tingkat_kesulitan === slot.difficulty && question.sub_materi === slot.databaseSubtopic)
      .sort((a, b) => rank(`${userId}:${kind}:${slot.difficulty}:${slot.databaseSubtopic}:${a.id}`).localeCompare(rank(`${userId}:${kind}:${slot.difficulty}:${slot.databaseSubtopic}:${b.id}`)));
    if (candidates.length <= slot.index) {
      missingSlots.push({ subtopicId: slot.subtopicId, databaseSubtopic: slot.databaseSubtopic, difficulty: slot.difficulty, required: slot.index + 1, available: candidates.length });
      return [];
    }
    return [candidates[slot.index]];
  });
  if (missingSlots.length) throw new EvaluationBlueprintError(kind, missingSlots);
  if (new Set(selected.map((question) => question.id)).size !== selected.length) {
    throw new EvaluationBlueprintError(kind, [{ subtopicId: "DUPLICATE", databaseSubtopic: "duplicate_question_id", difficulty: "semua", required: selected.length, available: new Set(selected.map((question) => question.id)).size }]);
  }
  return selected
    .sort((a, b) => rank(`order:${userId}:${kind}:${a.id}`).localeCompare(rank(`order:${userId}:${kind}:${b.id}`)))
    .map((question) => ({
      ...question,
      _option_order: (["a", "b", "c", "d", "e"] as const)
        .filter((key) => Boolean(question[`pilihan_${key}`]))
        .sort((a, b) => rank(`option:${userId}:${kind}:${question.id}:${a}`).localeCompare(rank(`option:${userId}:${kind}:${question.id}:${b}`))),
    }));
}

export function validateEvaluationPackage(questions: QuestionRow[]) {
  const difficulty = Object.fromEntries(difficultyLevels.map((level) => [level, questions.filter((question) => question.tingkat_kesulitan === level).length]));
  const subtopics = new Set(questions.map((question) => question.sub_materi));
  return {
    total: questions.length,
    unique: new Set(questions.map((question) => question.id)).size,
    difficulty,
    subtopicCount: subtopics.size,
    valid: questions.length === ASSESSMENT_BLUEPRINT.package.pretest
      && new Set(questions.map((question) => question.id)).size === questions.length
      && difficultyLevels.every((level) => difficulty[level] === ASSESSMENT_BLUEPRINT.package.difficulty_quota[level])
      && subtopics.size === ASSESSMENT_BLUEPRINT.categories.length,
  };
}
