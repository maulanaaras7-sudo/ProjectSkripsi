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
  assert.equal(prepareMathText("2**3 dan (x+1)**2"), "\\(2^{3}\\) dan \\((x+1)^{2}\\)");
});

test("perkalian memakai tanda kali dan pembagian menjadi pecahan", () => {
  assert.equal(prepareMathText("28*21=588"), "\\(28 \\times 21\\)=588");
  assert.equal(prepareMathText("(x-1)/2"), "\\(\\frac{(x-1)}{2}\\)");
  assert.equal(prepareMathText("f(x)/g(x)"), "\\(\\frac{f(x)}{g(x)}\\)");
  assert.equal(prepareMathText("x^2/2"), "\\(\\frac{x^2}{2}\\)");
  assert.equal(prepareMathText("a/b/c"), "\\(\\frac{\\frac{a}{b}}{c}\\)");
});

test("garis miring pada bahasa dan singkatan bukan pembagian", () => {
  assert.equal(prepareMathText("dan/atau"), "dan/atau");
  assert.equal(prepareMathText("R/S/T"), "R/S/T");
});

test("equation TeX yang sudah benar tidak dibungkus ulang", () => {
  const value = "Contoh \\(f(x)=x^{2}+1\\) dan \\[g(x)=2^x\\]";
  assert.equal(prepareMathText(value), value);
});

test("operator minus dan teks tanpa pangkat tidak berubah", () => {
  const value = "f(x)=2x-3 dan g(x)=x−2";
  assert.equal(prepareMathText(value), value);
});

