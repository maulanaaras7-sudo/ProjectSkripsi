import assert from "node:assert/strict";
import {
  compositionProperty, compositionValues, contextualFunction, inverseComposition,
  graphCommands, inverseReflection, inverseRequirement, mappingTable, operationValues,
} from "../lib/simulation-lab-math.ts";

const cases = [
  ["SIM-01 domain", () => assert.deepEqual(mappingTable().domain, [-2, -1, 0, 1, 2])],
  ["SIM-01 codomain", () => assert.deepEqual(mappingTable().codomain, [0, 1, 2, 3, 4])],
  ["SIM-01 range", () => assert.deepEqual(mappingTable().range, [0, 1, 4])],
  ["SIM-02 f", () => assert.equal(operationValues(2).f, 5)],
  ["SIM-02 g", () => assert.equal(operationValues(2).g, 0)],
  ["SIM-02 quotient undefined", () => assert.equal(operationValues(2).quotient, null)],
  ["SIM-03 g(2)", () => assert.equal(compositionValues(2).gx, 5)],
  ["SIM-03 f(g(2))", () => assert.equal(compositionValues(2).fog, 11)],
  ["SIM-03 g(f(2))", () => assert.equal(compositionValues(2).gof, 8)],
  ["SIM-04 noncommutative", () => assert.notEqual(compositionProperty("noncommutative").left, compositionProperty("noncommutative").right)],
  ["SIM-04 commutative", () => assert.equal(compositionProperty("commutative").left, compositionProperty("commutative").right)],
  ["SIM-04 associative", () => assert.equal(compositionProperty("associative").left, compositionProperty("associative").right)],
  ["SIM-04 identity", () => assert.equal(compositionProperty("identity").left, compositionProperty("identity").right)],
  ["SIM-05 R not bijective", () => assert.equal(inverseRequirement("all", 4).bijective, false)],
  ["SIM-05 x>=0", () => assert.equal(inverseRequirement("nonnegative", 4).inverse, "√x")],
  ["SIM-05 x<=0", () => assert.equal(inverseRequirement("nonpositive", 4).inverse, "−√x")],
  ["SIM-06 P", () => assert.deepEqual(inverseReflection(1).point, [1, 5])],
  ["SIM-06 Q", () => assert.deepEqual(inverseReflection(1).reflected, [5, 1])],
  ["SIM-07 inverse and order", () => { const value = inverseComposition(2); assert.equal(value.formula, "(x−7)/2"); assert.equal(value.order, "g⁻¹∘f⁻¹"); assert.equal(value.inverse, 2); }],
  ["SIM-08 reversible price", () => { const value = contextualFunction(100000); assert.equal(value.finalPrice, 85000); assert.equal(value.reversed, 100000); }],
];

for (const [name, verify] of cases) {
  verify();
  console.log(`✓ ${name}`);
}
console.log(`\n${cases.length} kasus matematika lulus.`);

for (const [moduleId, preset] of [["SIM-01", "square"], ["SIM-02", "sum"], ["SIM-03", "machine"], ["SIM-04", "noncommutative"], ["SIM-05", "nonnegative"], ["SIM-06", "reflection"], ["SIM-07", "inverse-composition"], ["SIM-08", "20-5"]]) {
  const first = graphCommands(moduleId, 1, preset).join(";");
  const second = graphCommands(moduleId, 2, preset).join(";");
  assert.notEqual(first, second, `${moduleId} harus mengirim perintah grafik berbeda ketika slider berubah`);
}
console.log("✓ Semua slider mengubah perintah grafik GeoGebra.");
