export type ExpressionResult = { ok: true; normalized: string } | { ok: false; error: string };

const allowedFunctions = new Set(["sqrt", "abs", "exp", "ln", "log"]);

type Token = { type: "number" | "name" | "operator" | "left" | "right" | "end"; value: string };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) { index += 1; continue; }
    if (/[0-9.]/.test(char)) {
      const match = source.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
      if (!match) throw new Error("Bilangan tidak valid.");
      tokens.push({ type: "number", value: match[0] }); index += match[0].length; continue;
    }
    if (/[A-Za-z]/.test(char)) {
      const match = source.slice(index).match(/^[A-Za-z]+/)!;
      tokens.push({ type: "name", value: match[0].toLowerCase() }); index += match[0].length; continue;
    }
    if ("+-*/^".includes(char)) { tokens.push({ type: "operator", value: char }); index += 1; continue; }
    if (char === "(") { tokens.push({ type: "left", value: char }); index += 1; continue; }
    if (char === ")") { tokens.push({ type: "right", value: char }); index += 1; continue; }
    throw new Error(`Karakter “${char}” tidak didukung.`);
  }
  tokens.push({ type: "end", value: "" });
  return tokens;
}

class Parser {
  private index = 0;
  private readonly tokens: Token[];
  private readonly x: number;
  constructor(tokens: Token[], x: number) { this.tokens = tokens; this.x = x; }
  parse() {
    const value = this.expression();
    if (this.current().type !== "end") throw new Error("Struktur tanda kurung atau operator tidak valid.");
    if (!Number.isFinite(value)) throw new Error("Hasil tidak terdefinisi pada nilai ini.");
    return value;
  }
  private current() { return this.tokens[this.index]; }
  private consume() { return this.tokens[this.index++]; }
  private expression(): number {
    let value = this.term();
    while (this.current().type === "operator" && (this.current().value === "+" || this.current().value === "-")) {
      const operator = this.consume().value; const right = this.term(); value = operator === "+" ? value + right : value - right;
    }
    return value;
  }
  private term(): number {
    let value = this.unary();
    while (true) {
      const token = this.current();
      if (token.type === "operator" && (token.value === "*" || token.value === "/")) {
        const operator = this.consume().value; const right = this.unary(); value = operator === "*" ? value * right : value / right; continue;
      }
      if (token.type === "number" || token.type === "name" || token.type === "left") { value *= this.unary(); continue; }
      return value;
    }
  }
  private unary(): number {
    if (this.current().type === "operator" && (this.current().value === "+" || this.current().value === "-")) {
      const operator = this.consume().value; const value = this.unary(); return operator === "-" ? -value : value;
    }
    return this.power();
  }
  private power(): number {
    let value = this.primary();
    if (this.current().type === "operator" && this.current().value === "^") { this.consume(); value **= this.unary(); }
    return value;
  }
  private primary(): number {
    const token = this.consume();
    if (token.type === "number") return Number(token.value);
    if (token.type === "name") {
      if (token.value === "x") return this.x;
      if (!allowedFunctions.has(token.value)) throw new Error(`Fungsi “${token.value}” belum didukung.`);
      if (this.consume().type !== "left") throw new Error(`Gunakan tanda kurung setelah ${token.value}.`);
      const argument = this.expression();
      if (this.consume().type !== "right") throw new Error("Tanda kurung penutup belum lengkap.");
      if (token.value === "sqrt") return Math.sqrt(argument);
      if (token.value === "abs") return Math.abs(argument);
      if (token.value === "exp") return Math.exp(argument);
      if (token.value === "ln") return Math.log(argument);
      return Math.log10(argument);
    }
    if (token.type === "left") {
      const value = this.expression();
      if (this.consume().type !== "right") throw new Error("Tanda kurung penutup belum lengkap.");
      return value;
    }
    throw new Error("Rumus belum lengkap.");
  }
}

export function validateExpression(expression: string): ExpressionResult {
  const normalized = expression.trim().replace(/−/g, "-").replace(/×/g, "*").replace(/÷/g, "/");
  if (!normalized) return { ok: false, error: "Rumus wajib diisi." };
  if (normalized.length > 80) return { ok: false, error: "Rumus terlalu panjang (maksimal 80 karakter)." };
  try { new Parser(tokenize(normalized), 1.2345).parse(); return { ok: true, normalized }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Rumus tidak valid." }; }
}

export function evaluateExpression(expression: string, x: number) {
  return new Parser(tokenize(expression), x).parse();
}

export function evaluateComposition(first: string, second: string, x: number) {
  const intermediate = evaluateExpression(second, x);
  return { intermediate, result: evaluateExpression(first, intermediate) };
}

export function getInverseDescription(expression: string) {
  const compact = expression.replace(/\s/g, "");
  if (compact === "x^2") return { formula: null, note: "Tidak memiliki invers fungsi pada seluruh bilangan real. Batasi domain ke x≥0 untuk memperoleh √x." };
  const reciprocal = compact.match(/^1\/\(x([+-]\d+(?:\.\d+)?)\)$/);
  if (reciprocal) {
    const shift = Number(reciprocal[1]); const center = -shift;
    return { formula: `${center}+1/x`, note: "Invers berlaku untuk x≠0 dengan domain dan kodomain yang sesuai." };
  }
  try {
    const y0 = evaluateExpression(compact, 0); const y1 = evaluateExpression(compact, 1); const y2 = evaluateExpression(compact, 2);
    const slope = y1 - y0;
    if (Math.abs((y2 - y1) - slope) < 1e-9 && Math.abs(slope) > 1e-9) {
      const intercept = y0;
      return { formula: `(x${intercept >= 0 ? `-${intercept}` : `+${Math.abs(intercept)}`})/${slope}`, note: "Fungsi linear dengan gradien bukan nol bersifat bijektif pada ℝ." };
    }
  } catch { /* Status simbolik dijelaskan di bawah. */ }
  return { formula: null, note: "Belum dapat ditentukan secara simbolik pada bentuk ini." };
}
