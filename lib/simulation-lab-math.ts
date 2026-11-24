export const SIMULATION_MODULE_IDS = [
  "SIM-01", "SIM-02", "SIM-03", "SIM-04", "SIM-05", "SIM-06", "SIM-07", "SIM-08",
] as const;

export type SimulationModuleId = (typeof SIMULATION_MODULE_IDS)[number];
export type InverseDomain = "all" | "nonnegative" | "nonpositive";
export type CompositionProperty = "noncommutative" | "commutative" | "associative" | "identity";

export function mappingTable() {
  const domain = [-2, -1, 0, 1, 2];
  const codomain = [0, 1, 2, 3, 4];
  const pairs = domain.map((x) => ({ x, y: x * x }));
  return { domain, codomain, range: [0, 1, 4], pairs };
}

export function operationValues(x: number) {
  const f = 2 * x + 1;
  const g = x - 2;
  return {
    x, f, g,
    sum: f + g,
    difference: f - g,
    product: f * g,
    quotient: g === 0 ? null : f / g,
  };
}

export function compositionValues(x: number) {
  const f = (value: number) => 2 * value + 1;
  const g = (value: number) => value + 3;
  return { x, gx: g(x), fx: f(x), fog: f(g(x)), gof: g(f(x)) };
}

export function compositionProperty(kind: CompositionProperty, x = 2) {
  if (kind === "commutative") {
    const f = (value: number) => value + 1;
    const g = (value: number) => value + 2;
    return { label: "Komutatif", left: f(g(x)), right: g(f(x)), conclusion: "f∘g = g∘f untuk pasangan translasi ini." };
  }
  if (kind === "associative") {
    const f = (value: number) => 2 * value;
    const g = (value: number) => value + 1;
    const h = (value: number) => value - 3;
    return { label: "Asosiatif", left: f(g(h(x))), right: f(g(h(x))), conclusion: "(f∘g)∘h = f∘(g∘h)." };
  }
  if (kind === "identity") {
    const f = (value: number) => 2 * value + 1;
    const identity = (value: number) => value;
    return { label: "Identitas", left: f(identity(x)), right: identity(f(x)), conclusion: "f∘I = I∘f = f." };
  }
  const f = (value: number) => 2 * value + 1;
  const g = (value: number) => value * value;
  return { label: "Tidak komutatif", left: f(g(x)), right: g(f(x)), conclusion: "Umumnya f∘g ≠ g∘f." };
}

export function inverseRequirement(domain: InverseDomain, input: number) {
  if (domain === "all") return { domain, inverse: null, bijective: false, output: input * input, explanation: "x² pada ℝ→ℝ tidak satu-satu, sehingga tidak memiliki invers fungsi." };
  if (domain === "nonpositive") return { domain, inverse: "−√x", bijective: true, output: -Math.sqrt(Math.max(0, input)), explanation: "Pada domain x≤0, cabang inversnya adalah −√x." };
  return { domain, inverse: "√x", bijective: true, output: Math.sqrt(Math.max(0, input)), explanation: "Pada domain x≥0, cabang inversnya adalah √x." };
}

export function inverseReflection(x: number) {
  const y = 2 * x + 3;
  return { x, y, point: [x, y] as const, reflected: [y, x] as const, inverseAtY: (y - 3) / 2 };
}

export function inverseComposition(x: number) {
  const composed = 2 * x + 7;
  const inverse = (composed - 7) / 2;
  return { x, composed, inverse, formula: "(x−7)/2", order: "g⁻¹∘f⁻¹" };
}

export function contextualFunction(price: number, discount = 0.2, fee = 5000) {
  const finalPrice = price * (1 - discount) + fee;
  const reversed = (finalPrice - fee) / (1 - discount);
  return { price, discount, fee, finalPrice, reversed, formula: "0,8x + 5.000", inverseFormula: "(x−5.000)/0,8" };
}

/** Commands are trusted, internal GeoGebra syntax. */
export function graphCommands(moduleId: SimulationModuleId, x: number, preset: string): string[] {
  const safeX = Number.isFinite(x) ? x : 0;
  switch (moduleId) {
    case "SIM-01": return ["f(x)=x^2", "A=(-2,4)", "B=(-1,1)", "C=(0,0)", "D=(1,1)", "E=(2,4)"];
    case "SIM-02": return ["f(x)=2x+1", "g(x)=x-2", `P=(${safeX},${2 * safeX + 1})`, `Q=(${safeX},${safeX - 2})`];
    case "SIM-03": return ["f(x)=2x+1", "g(x)=x+3", "h(x)=f(g(x))", `P=(${safeX},${2 * safeX + 7})`];
    case "SIM-04":
      if (preset === "commutative") return ["f(x)=x+1", "g(x)=x+2", "h(x)=f(g(x))"];
      if (preset === "identity") return ["f(x)=2x+1", "I(x)=x", "h(x)=f(I(x))"];
      return ["f(x)=2x+1", "g(x)=x^2", "h(x)=f(g(x))", "k(x)=g(f(x))"];
    case "SIM-05":
      if (preset === "nonpositive") return ["f(x)=If(x<=0,x^2)", "g(x)=-sqrt(x)"];
      if (preset === "nonnegative") return ["f(x)=If(x>=0,x^2)", "g(x)=sqrt(x)"];
      return ["f(x)=x^2"];
    case "SIM-06": return ["f(x)=2x+3", "i(x)=x", `P=(${safeX},${2 * safeX + 3})`, `Q=(${2 * safeX + 3},${safeX})`];
    case "SIM-07": return ["f(x)=2x+3", "g(x)=x+2", "h(x)=f(g(x))", "k(x)=(x-7)/2"];
    case "SIM-08": return ["f(x)=0.8x+5000", "g(x)=(x-5000)/0.8", `P=(${safeX},${0.8 * safeX + 5000})`];
  }
}
