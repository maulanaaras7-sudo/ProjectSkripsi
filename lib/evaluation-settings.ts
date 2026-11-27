import {
  DEFAULT_EVALUATION_DURATION_MINUTES,
  MAX_EVALUATION_DURATION_MINUTES,
  MIN_EVALUATION_DURATION_MINUTES,
} from "@/lib/constants";
import { rows } from "@/lib/db";

export type EvaluationKind = "pretest" | "posttest";
export type EvaluationDurations = Record<EvaluationKind, number>;

interface DurationRow extends Record<string, unknown> {
  jenis: EvaluationKind;
  durasi_menit: number;
}

export function validEvaluationDuration(value: unknown) {
  const duration = Number(value);
  return Number.isInteger(duration)
    && duration >= MIN_EVALUATION_DURATION_MINUTES
    && duration <= MAX_EVALUATION_DURATION_MINUTES;
}

export async function evaluationDurations(): Promise<EvaluationDurations> {
  const defaults: EvaluationDurations = {
    pretest: DEFAULT_EVALUATION_DURATION_MINUTES,
    posttest: DEFAULT_EVALUATION_DURATION_MINUTES,
  };
  try {
    const settings = await rows<DurationRow[]>(
      "SELECT jenis,durasi_menit FROM evaluation_settings WHERE jenis IN ('pretest','posttest')",
    );
    for (const setting of settings) {
      if (validEvaluationDuration(setting.durasi_menit)) defaults[setting.jenis] = Number(setting.durasi_menit);
    }
  } catch {
    // Deployment lama tetap memakai durasi bawaan sampai migrasi diterapkan.
  }
  return defaults;
}

export async function evaluationDurationMinutes(kind: EvaluationKind) {
  return (await evaluationDurations())[kind];
}
