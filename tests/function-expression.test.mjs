import assert from "node:assert/strict";
import { evaluateComposition, evaluateExpression, getInverseDescription, validateExpression } from "../lib/function-expression.ts";

assert.equal(evaluateExpression("2x+1", 2), 5);
assert.equal(evaluateExpression("x^2", -3), 9);
assert.equal(evaluateExpression("sqrt(x)", 9), 3);
assert.equal(evaluateExpression("1/(x-2)", 3), 1);
assert.throws(() => evaluateExpression("1/(x-2)", 2));
assert.deepEqual(evaluateComposition("2x+1", "x-3", 2), { intermediate: -1, result: -1 });
assert.equal(getInverseDescription("2x+1").formula, "(x-1)/2");
assert.equal(getInverseDescription("x-3").formula, "(x+3)/1");
assert.equal(getInverseDescription("x^2").formula, null);
assert.equal(getInverseDescription("1/(x-2)").formula, "2+1/x");
assert.equal(validateExpression("alert(1)").ok, false);
assert.equal(validateExpression("").ok, false);
console.log("✓ Parser aman dan kasus eksplorasi fungsi lulus.");
