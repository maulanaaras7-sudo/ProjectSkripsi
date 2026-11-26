const hyphenatedAxisPattern = /\bsumbu[-‐‑‒–—−]([xy])\b/giu;

export function normalizeAxisTerms(value: string) {
  return value.replace(hyphenatedAxisPattern, (match, axis: string) => `${match.startsWith("S") ? "Sumbu" : "sumbu"} ${axis.toLowerCase()}`);
}

