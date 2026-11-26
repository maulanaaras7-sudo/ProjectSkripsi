import assert from "node:assert/strict";
import test from "node:test";
import { ASSESSMENT_BLUEPRINT, ASSESSMENT_SLOTS, difficultyLevels } from "../lib/assessment-blueprint.ts";
import { EvaluationBlueprintError, selectEvaluationPackage, validateEvaluationPackage } from "../lib/evaluation-selection.ts";

function question(id, kind, difficulty, subtopic) {
  return {
    id,
    jenis: kind,
    tingkat_kesulitan: difficulty,
    sub_materi: subtopic,
    pertanyaan: `Soal ${id}`,
    pilihan_a: "opsi a",
    pilihan_b: "opsi b",
    pilihan_c: "jawaban benar",
    pilihan_d: "opsi d",
    pilihan_e: "opsi e",
    jawaban_benar: "c",
    pembahasan: "Pembahasan",
  };
}

function bank() {
  let id = 1;
  return ["pretest", "posttest"].flatMap((kind) => ASSESSMENT_SLOTS.flatMap((slot) =>
    Array.from({ length: 4 }, () => question(id++, kind, slot.difficulty, slot.databaseSubtopic)),
  ));
}

test("blueprint tervalidasi sebagai 25 slot dengan kuota 8/9/8", () => {
  assert.equal(ASSESSMENT_SLOTS.length, 25);
  assert.equal(ASSESSMENT_BLUEPRINT.categories.length, 9);
  assert.deepEqual(ASSESSMENT_BLUEPRINT.package.difficulty_quota, { rendah: 8, sedang: 9, tinggi: 8 });
});

test("paket stabil, unik, lengkap, dan terisolasi untuk beberapa identitas", () => {
  const source = bank();
  for (const userId of [1, 2, 17, 99, 2026]) {
    const packages = {};
    for (const kind of ["pretest", "posttest"]) {
      const first = selectEvaluationPackage(source, userId, kind);
      const reload = selectEvaluationPackage(source, userId, kind);
      packages[kind] = first;
      assert.deepEqual(first.map((item) => [item.id, item._option_order]), reload.map((item) => [item.id, item._option_order]));
      assert.equal(first.length, 25);
      assert.equal(new Set(first.map((item) => item.id)).size, 25);
      assert.equal(new Set(first.map((item) => item.sub_materi)).size, 9);
      assert.ok(first.every((item) => item.jenis === kind));
      for (const level of difficultyLevels) assert.equal(first.filter((item) => item.tingkat_kesulitan === level).length, ASSESSMENT_BLUEPRINT.package.difficulty_quota[level]);
      assert.ok(first.every((item) => item.jawaban_benar === "c" && item._option_order.includes("c") && new Set(item._option_order).size === 5));
      assert.equal(validateEvaluationPackage(first).valid, true);
    }
    assert.equal(packages.pretest.some((pre) => packages.posttest.some((post) => pre.id === post.id)), false);
  }
});

test("slot kosong gagal terkontrol tanpa fallback kategori lain", () => {
  const source = bank();
  const missing = ASSESSMENT_SLOTS[0];
  const incomplete = source.filter((item) => !(item.jenis === "pretest" && item.tingkat_kesulitan === missing.difficulty && item.sub_materi === missing.databaseSubtopic));
  assert.throws(() => selectEvaluationPackage(incomplete, 7, "pretest"), (error) => {
    assert.ok(error instanceof EvaluationBlueprintError);
    assert.equal(error.code, "ASSESSMENT_BLUEPRINT_UNAVAILABLE");
    assert.equal(error.missingSlots[0].subtopicId, missing.subtopicId);
    assert.equal(error.missingSlots[0].available, 0);
    return true;
  });
});

