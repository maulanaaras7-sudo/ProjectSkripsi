const delimitedMathPattern = /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g;

const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

function matchingOpen(value: string, closeIndex: number) {
  const close = value[closeIndex];
  const open = pairs[close];
  if (!open) return closeIndex;
  let depth = 0;
  for (let index = closeIndex; index >= 0; index -= 1) {
    if (value[index] === close) depth += 1;
    else if (value[index] === open) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return closeIndex;
}

function powerBaseStart(value: string, caretIndex: number) {
  let index = caretIndex - 1;
  if (index < 0) return caretIndex;
  if (value[index] in pairs) {
    index = matchingOpen(value, index);
    while (index > 0 && /[A-Za-z0-9_]/.test(value[index - 1])) index -= 1;
    return index;
  }
  while (index >= 0 && /[A-Za-z0-9_.]/.test(value[index])) index -= 1;
  return index + 1;
}

function powerEnd(value: string, caretIndex: number) {
  let index = caretIndex + 1;
  if (value[index] === "{") {
    const close = value.indexOf("}", index + 1);
    return close < 0 ? caretIndex + 1 : close + 1;
  }
  if (value[index] === "+" || value[index] === "-") index += 1;
  if (value[index] === "(") {
    let depth = 0;
    for (let cursor = index; cursor < value.length; cursor += 1) {
      if (value[cursor] === "(") depth += 1;
      else if (value[cursor] === ")") {
        depth -= 1;
        if (depth === 0) return cursor + 1;
      }
    }
    return caretIndex + 1;
  }
  const token = value.slice(index).match(/^(?:\d+(?:\.\d+)?|\.\d+|[A-Za-z][A-Za-z0-9]*)/);
  return token ? index + token[0].length : index;
}

function exponentValue(raw: string) {
  return raw.startsWith("{") && raw.endsWith("}") ? raw.slice(1, -1) : raw;
}

function wrapPlainPowers(value: string) {
  let output = "";
  let consumed = 0;
  for (let caret = value.indexOf("^"); caret >= 0; caret = value.indexOf("^", caret + 1)) {
    if (caret > 0 && value[caret - 1] === "\\") continue;
    const start = powerBaseStart(value, caret);
    const end = powerEnd(value, caret);
    if (start >= caret || start < consumed || end <= caret + 1) continue;
    const base = value.slice(start, caret);
    const exponent = exponentValue(value.slice(caret + 1, end));
    if (!base || !exponent) continue;
    output += value.slice(consumed, start);
    output += `\\(${base}^{${exponent}}\\)`;
    consumed = end;
  }
  return output + value.slice(consumed);
}

/** Adds MathJax delimiters only to plain-text powers; existing TeX remains untouched. */
export function prepareMathText(value: string) {
  let output = "";
  let cursor = 0;
  for (const match of value.matchAll(delimitedMathPattern)) {
    const index = match.index ?? 0;
    output += wrapPlainPowers(value.slice(cursor, index));
    output += match[0];
    cursor = index + match[0].length;
  }
  return output + wrapPlainPowers(value.slice(cursor));
}

