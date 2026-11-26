import blueprintSource from "../references/Fungsiverse_KisiKisi_Codex_20261126/BLUEPRINT_9_SUBMATERI.json" with { type: "json" };

export const difficultyLevels = ["rendah", "sedang", "tinggi"] as const;
export type DifficultyLevel = (typeof difficultyLevels)[number];
export type EvaluationKind = "pretest" | "posttest";

type Quota = Record<DifficultyLevel, number>;
type BlueprintCategory = {
  id: string;
  database_value: string;
  title: string;
  tp: string;
  indicator: string;
  bank_target_per_test: Quota;
  package_quota_per_test: Quota;
};
type Blueprint = {
  title: string;
  version: string;
  bank: {
    pretest: number;
    posttest: number;
    difficulty_totals_per_bank: Quota;
    choices: string[];
  };
  package: {
    pretest: number;
    posttest: number;
    difficulty_quota: Quota;
  };
  categories: BlueprintCategory[];
};

export class AssessmentBlueprintConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentBlueprintConfigurationError";
  }
}

function quota(value: unknown, label: string): Quota {
  if (!value || typeof value !== "object") throw new AssessmentBlueprintConfigurationError(`${label} tidak valid.`);
  const source = value as Record<string, unknown>;
  const result = Object.fromEntries(difficultyLevels.map((level) => {
    const amount = source[level];
    if (!Number.isInteger(amount) || Number(amount) < 0) throw new AssessmentBlueprintConfigurationError(`${label}.${level} harus berupa bilangan bulat nonnegatif.`);
    return [level, Number(amount)];
  })) as Quota;
  return result;
}

function validateBlueprint(value: unknown): Blueprint {
  if (!value || typeof value !== "object") throw new AssessmentBlueprintConfigurationError("Blueprint evaluasi tidak dapat dibaca.");
  const source = value as Record<string, unknown>;
  if (!Array.isArray(source.categories) || source.categories.length !== 9) throw new AssessmentBlueprintConfigurationError("Blueprint harus memuat tepat sembilan submateri.");
  const packageSource = source.package as Record<string, unknown> | undefined;
  const bankSource = source.bank as Record<string, unknown> | undefined;
  if (!packageSource || !bankSource) throw new AssessmentBlueprintConfigurationError("Konfigurasi bank atau paket tidak lengkap.");
  const categories = source.categories.map((entry, index) => {
    if (!entry || typeof entry !== "object") throw new AssessmentBlueprintConfigurationError(`Submateri ke-${index + 1} tidak valid.`);
    const category = entry as Record<string, unknown>;
    for (const key of ["id", "database_value", "title", "tp", "indicator"] as const) {
      if (typeof category[key] !== "string" || !category[key].trim()) throw new AssessmentBlueprintConfigurationError(`Submateri ke-${index + 1} tidak memiliki ${key}.`);
    }
    return {
      id: category.id as string,
      database_value: category.database_value as string,
      title: category.title as string,
      tp: category.tp as string,
      indicator: category.indicator as string,
      bank_target_per_test: quota(category.bank_target_per_test, `${category.id}.bank_target_per_test`),
      package_quota_per_test: quota(category.package_quota_per_test, `${category.id}.package_quota_per_test`),
    };
  });
  if (new Set(categories.map((category) => category.id)).size !== categories.length) throw new AssessmentBlueprintConfigurationError("Kode submateri harus unik.");
  if (new Set(categories.map((category) => category.database_value)).size !== categories.length) throw new AssessmentBlueprintConfigurationError("Nilai submateri database harus unik.");
  const difficultyQuota = quota(packageSource.difficulty_quota, "package.difficulty_quota");
  const bankDifficulty = quota(bankSource.difficulty_totals_per_bank, "bank.difficulty_totals_per_bank");
  const packageTotal = categories.reduce((total, category) => total + difficultyLevels.reduce((sum, level) => sum + category.package_quota_per_test[level], 0), 0);
  const bankTotal = categories.reduce((total, category) => total + difficultyLevels.reduce((sum, level) => sum + category.bank_target_per_test[level], 0), 0);
  if (packageTotal !== 25 || packageSource.pretest !== 25 || packageSource.posttest !== 25) throw new AssessmentBlueprintConfigurationError("Total slot paket harus 25 untuk PRE dan POST.");
  if (bankTotal !== 100 || bankSource.pretest !== 100 || bankSource.posttest !== 100) throw new AssessmentBlueprintConfigurationError("Target inventaris harus 100 untuk setiap bank.");
  for (const level of difficultyLevels) {
    const packageByCategories = categories.reduce((sum, category) => sum + category.package_quota_per_test[level], 0);
    const bankByCategories = categories.reduce((sum, category) => sum + category.bank_target_per_test[level], 0);
    if (packageByCategories !== difficultyQuota[level]) throw new AssessmentBlueprintConfigurationError(`Kuota paket ${level} tidak konsisten.`);
    if (bankByCategories !== bankDifficulty[level]) throw new AssessmentBlueprintConfigurationError(`Target bank ${level} tidak konsisten.`);
  }
  if (!Array.isArray(bankSource.choices) || bankSource.choices.join("") !== "ABCDE") throw new AssessmentBlueprintConfigurationError("Pilihan jawaban blueprint harus A–E.");
  return {
    title: String(source.title),
    version: String(source.version),
    bank: { pretest: Number(bankSource.pretest), posttest: Number(bankSource.posttest), difficulty_totals_per_bank: bankDifficulty, choices: bankSource.choices as string[] },
    package: { pretest: Number(packageSource.pretest), posttest: Number(packageSource.posttest), difficulty_quota: difficultyQuota },
    categories,
  };
}

export const ASSESSMENT_BLUEPRINT = validateBlueprint(blueprintSource);
export const ASSESSMENT_SLOTS = ASSESSMENT_BLUEPRINT.categories.flatMap((category) =>
  difficultyLevels.flatMap((difficulty) => Array.from({ length: category.package_quota_per_test[difficulty] }, (_, index) => ({
    subtopicId: category.id,
    databaseSubtopic: category.database_value,
    difficulty,
    index,
  }))),
);

