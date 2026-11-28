import assert from "node:assert/strict";
import test from "node:test";
import {
  EVALUATION_SUBMIT_GRACE_MS,
  remainingEvaluationSeconds,
  resolveEvaluationAnswers,
} from "../lib/evaluation-deadline.ts";

test("menghitung sisa waktu dari deadline absolut", () => {
  assert.equal(remainingEvaluationSeconds(70_001, 10_000), 61);
  assert.equal(remainingEvaluationSeconds(10_000, 10_000), 0);
  assert.equal(remainingEvaluationSeconds(9_000, 10_000), 0);
});

test("jawaban kiriman diterima sebelum dan sesaat setelah deadline", () => {
  const draft = { "1": "a", "2": "b" };
  const submitted = { "2": "c", "3": "d" };
  assert.deepEqual(resolveEvaluationAnswers(draft, submitted, 20_000, 19_000), {
    timeExpired: false,
    answers: { "1": "a", "2": "c", "3": "d" },
  });
  assert.deepEqual(resolveEvaluationAnswers(draft, submitted, 20_000, 20_000 + EVALUATION_SUBMIT_GRACE_MS), {
    timeExpired: true,
    answers: { "1": "a", "2": "c", "3": "d" },
  });
});

test("setelah toleransi berakhir hanya draf sebelum deadline yang dinilai", () => {
  const result = resolveEvaluationAnswers(
    { "1": "a", "2": "b" },
    { "1": "e", "3": "d" },
    20_000,
    20_000 + EVALUATION_SUBMIT_GRACE_MS + 1,
  );
  assert.equal(result.timeExpired, true);
  assert.deepEqual(result.answers, { "1": "a", "2": "b" });
});
