export const PRETEST_LOW_BOUNDARY = 50;
export const PRETEST_HIGH_BOUNDARY = 75;
export const TRAINING_PASS_PERCENTAGE = 80;
export const TRAINING_MAX_SESSIONS_PER_LEVEL = 10;
export const TRAINING_QUESTIONS_PER_SESSION = 10;
export const EVALUATION_QUESTIONS_PER_TEST = 25;
export const DEFAULT_EVALUATION_DURATION_MINUTES = 60;
export const MIN_EVALUATION_DURATION_MINUTES = 5;
export const MAX_EVALUATION_DURATION_MINUTES = 180;
export const EVALUATION_DURATION_SECONDS = DEFAULT_EVALUATION_DURATION_MINUTES * 60;

export const LEVELS = ["rendah", "sedang", "tinggi"] as const;
export type Level = (typeof LEVELS)[number];

export const levelLabel = (level: string | null) =>
  level ? level.charAt(0).toUpperCase() + level.slice(1) : "Belum ditentukan";
