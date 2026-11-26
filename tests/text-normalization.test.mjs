import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAxisTerms } from "../lib/text-normalization.ts";

test("menormalkan variasi tanda hubung pada label sumbu", () => {
  assert.equal(normalizeAxisTerms("sumbu-x, sumbu‑y, Sumbu–x"), "sumbu x, sumbu y, Sumbu x");
});

test("tidak mengubah minus matematika, kode, atau simbol sumbu", () => {
  const value = "f(x)=2x−3, g(x)=x-2, class-axis-x, dan label x serta y";
  assert.equal(normalizeAxisTerms(value), value);
});

