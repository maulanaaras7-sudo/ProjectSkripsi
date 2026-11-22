"use client";

import { useEffect, useState } from "react";

type Level = "rendah" | "sedang" | "tinggi";
type Example = { id: number; urutan: number; sub_materi: string; pertanyaan: string; pilihan_a: string; pilihan_b: string; pilihan_c: string; pilihan_d: string; pilihan_e: string | null; hint_1: string; hint_2: string; pernah_benar: number };
type Feedback = { correct: boolean; correctAnswer: string; feedback: string; discussion: string };
const labels: Record<Level, string> = { rendah: "Rendah", sedang: "Sedang", tinggi: "Tinggi" };

export function ExamplePractice({ activeLevel }: { activeLevel: Level | null }) {
  const [level, setLevel] = useState<Level | null>(activeLevel);
  const [available, setAvailable] = useState<Level[]>([]);
  const [examples, setExamples] = useState<Example[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  async function load(next?: Level) {
    const response = await fetch(`/api/examples${next ? `?level=${next}` : ""}`);
    const data = await response.json();
    if (!response.ok) { setReady(true); return; }
    setLevel(data.level); setAvailable(data.unlockedLevels ?? []); setExamples(data.examples ?? []); setAnswers({}); setFeedback({}); setHints({}); setReady(true);
  }
  useEffect(() => { void load(activeLevel ?? undefined); }, [activeLevel]);
  if (!ready || !examples.length || !level) return null;

  async function check(example: Example) {
    if (!answers[example.id] || busy !== null) return;
    setBusy(example.id);
    const response = await fetch("/api/examples", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ exampleId: example.id, answer: answers[example.id] }) });
    const data = await response.json();
    if (response.ok) setFeedback((value) => ({ ...value, [example.id]: data }));
    setBusy(null);
  }
  return <details className="example-module panel" open={open} onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}><summary><span><b>Contoh soal · Tingkat {labels[level]}</b><small>{examples.filter((item) => item.pernah_benar || feedback[item.id]?.correct).length} dari {examples.length} contoh sudah dipahami</small></span><span className="btn-small">Buka/tutup</span></summary><p className="example-intro">Pelajari contoh berikut sebelum memulai sesi. Bagian ini tidak memengaruhi skor dan dapat dibuka kembali kapan saja.</p><div className="example-level-tabs">{available.map((item) => <button type="button" className={`btn-small ${item === level ? "active" : ""}`} key={item} onClick={() => void load(item)}>{labels[item]}</button>)}</div>{examples.map((example) => { const result = feedback[example.id]; const completed = Boolean(example.pernah_benar || result?.correct); return <article className={`example-card ${completed ? "is-complete" : ""}`} key={example.id}><div className="question-number">Contoh {example.urutan} · {example.sub_materi}</div><p className="question-text">{example.pertanyaan}</p><div className="example-hints"><button type="button" className="btn-small" onClick={() => setHints((value) => ({ ...value, [`${example.id}-1`]: !value[`${example.id}-1`] }))}>Petunjuk 1</button><button type="button" className="btn-small" onClick={() => setHints((value) => ({ ...value, [`${example.id}-2`]: !value[`${example.id}-2`] }))}>Petunjuk 2</button>{hints[`${example.id}-1`] && <p>{example.hint_1}</p>}{hints[`${example.id}-2`] && <p>{example.hint_2}</p>}</div><div className="question-options">{(["a", "b", "c", "d", "e"] as const).map((key, index) => example[`pilihan_${key}`] ? <label className={`question-option ${result?.correctAnswer === key ? "is-correct" : result && answers[example.id] === key ? "is-wrong" : ""}`} key={key}><input type="radio" name={`example-${example.id}`} value={key} disabled={Boolean(result?.correct)} checked={answers[example.id] === key} onChange={() => setAnswers((value) => ({ ...value, [example.id]: key }))} /><span><strong>{String.fromCharCode(65 + index)}.</strong> {example[`pilihan_${key}`]}</span></label> : null)}</div>{!result?.correct && <button type="button" className="btn-primary" disabled={!answers[example.id] || busy !== null} onClick={() => void check(example)}>{busy === example.id ? "Memeriksa…" : "Periksa jawaban"}</button>}{result && <div className={`example-discussion ${result.correct ? "is-correct" : "is-wrong"}`}><strong>{result.feedback}</strong><p>Pembahasan: {result.discussion}</p></div>}</article>; })}</details>;
}
