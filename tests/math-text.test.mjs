import assert from "node:assert/strict";
import test from "node:test";
import { prepareMathText } from "../lib/math-text.ts";

test("pangkat teks biasa dibungkus sebagai equation MathJax", () => {
  assert.equal(prepareMathText("f(x)=x^2+1"), "f(x)=\\(x^{2}\\)+1");
  assert.equal(prepareMathText("f(x)=(x-1)^2+3"), "f(x)=\\((x-1)^{2}\\)+3");
  assert.equal(prepareMathText("2^x dan a^(n+1)"), "\\(2^{x}\\) dan \\(a^{(n+1)}\\)");
  assert.equal(prepareMathText("x^2 + y^3."), "\\(x^{2}\\) + \\(y^{3}\\).");
  assert.equal(prepareMathText("x^0.5."), "\\(x^{0.5}\\).");
});

test("notasi invers ditampilkan sebagai pangkat negatif", () => {
  assert.equal(prepareMathText("f^-1(x) dan f_2^-1(x)"), "\\(f^{-1}\\)(x) dan \\(f_2^{-1}\\)(x)");
});

test("equation TeX yang sudah benar tidak dibungkus ulang", () => {
  const value = "Contoh \\(f(x)=x^{2}+1\\) dan \\[g(x)=2^x\\]";
  assert.equal(prepareMathText(value), value);
});

test("operator minus dan teks tanpa pangkat tidak berubah", () => {
  const value = "f(x)=2x-3 dan g(x)=x−2";
  assert.equal(prepareMathText(value), value);
});

