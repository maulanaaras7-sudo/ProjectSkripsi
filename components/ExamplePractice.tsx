"use client";

import { useEffect, useState } from "react";
import { MathText } from "@/components/MathText";

type Level = "rendah" | "sedang" | "tinggi";
type Example = { id:number; urutan:number; sub_materi:string; pertanyaan:string; pilihan_a:string; pilihan_b:string; pilihan_c:string; pilihan_d:string; pilihan_e:string|null; hint_1:string; hint_2:string; pernah_benar:number };
type Feedback = { correct:boolean; correctAnswer:string; feedback:string; discussion:string };
const labels:Record<Level, string> = { rendah:"Rendah", sedang:"Sedang", tinggi:"Tinggi" };

export function ExamplePractice({ activeLevel }: { activeLevel:Level | null }) {
  const [level, setLevel] = useState<Level | null>(activeLevel);
  const [available, setAvailable] = useState<Level[]>([]);
  const [examples, setExamples] = useState<Example[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, Feedback>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);

  async function load(next?:Level, nextPage = 1) {
    const query = new URLSearchParams({ page:String(nextPage) });
    if (next) query.set("level", next);
    const response = await fetch(`/api/examples?${query}`);
    const data = await response.json();
    if (!response.ok) { setReady(true); return; }
    setLevel(data.level); setAvailable(data.unlockedLevels ?? []); setExamples(data.examples ?? []); setPage(data.page ?? 1); setPages(data.pages ?? 1); setTotal(data.total ?? 0); setCompleted(data.completed ?? 0); setAnswers({}); setFeedback({}); setHints({}); setReady(true);
  }
  useEffect(() => { void load(activeLevel ?? undefined); }, [activeLevel]);
  async function check(example:Example) { if (!answers[example.id] || busy !== null) return; setBusy(example.id); const response = await fetch("/api/examples", { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify({ exampleId:example.id, answer:answers[example.id] }) }); const data = await response.json(); if (response.ok) { setFeedback((value) => ({ ...value, [example.id]:data })); if (data.correct) setCompleted((value) => value + 1); } setBusy(null); }

  if (!ready || !examples.length || !level) return null;
  return <details className="example-module panel" open={open} onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}><summary><span><b>Contoh soal · Tingkat {labels[level]}</b><small>{completed} dari {total} contoh sudah dipahami</small></span><span className="btn-small">Buka/tutup</span></summary><p className="example-intro">Pelajari contoh berikut sebelum memulai sesi. Bagian ini tidak memengaruhi skor dan dapat dibuka kembali kapan saja.</p><div className="example-level-tabs">{available.map((item) => <button type="button" className={`btn-small ${item === level ? "active" : ""}`} key={item} onClick={() => void load(item, 1)}>{labels[item]}</button>)}</div>{examples.map((example) => { const result = feedback[example.id]; const done = Boolean(example.pernah_benar || result?.correct); return <article className={`example-card ${done ? "is-complete" : ""}`} key={example.id}><div className="question-number">Contoh soal {example.urutan} dari {total} · {example.sub_materi}</div><p className="question-text"><MathText>{example.pertanyaan}</MathText></p><div className="example-hints"><button type="button" className="btn-small" onClick={() => setHints((value) => ({ ...value, [`${example.id}-1`]:!value[`${example.id}-1`] }))}>Buka petunjuk 1</button><button type="button" className="btn-small" onClick={() => setHints((value) => ({ ...value, [`${example.id}-2`]:!value[`${example.id}-2`] }))}>Buka petunjuk 2</button>{hints[`${example.id}-1`] && <p><MathText>{example.hint_1}</MathText></p>}{hints[`${example.id}-2`] && <p><MathText>{example.hint_2}</MathText></p>}</div><div className="question-options">{(["a", "b", "c", "d", "e"] as const).map((key, index) => example[`pilihan_${key}`] ? <label className={`question-option ${result?.correctAnswer === key ? "is-correct" : result && answers[example.id] === key ? "is-wrong" : ""}`} key={key}><input type="radio" name={`example-${example.id}`} value={key} disabled={Boolean(result?.correct)} checked={answers[example.id] === key} onChange={() => setAnswers((value) => ({ ...value, [example.id]:key }))} /><span><strong>{String.fromCharCode(65 + index)}.</strong> <MathText>{example[`pilihan_${key}`] ?? ""}</MathText></span></label> : null)}</div>{!result?.correct && <button type="button" className="btn-primary" disabled={!answers[example.id] || busy !== null} onClick={() => void check(example)}>{busy === example.id ? "Memeriksa…" : "Periksa jawaban"}</button>}{result && <div className={`example-discussion ${result.correct ? "is-correct" : "is-wrong"}`}><strong>{result.feedback}</strong><p>Pembahasan: <MathText>{result.discussion}</MathText></p></div>}</article>; })}{pages > 1 && <nav className="example-pagination" aria-label="Halaman contoh soal">{Array.from({ length:pages }, (_, index) => index + 1).map((number) => <button className={`btn-small ${number === page ? "active" : ""}`} type="button" key={number} onClick={() => void load(level, number)}>{number}</button>)}</nav>}</details>;
}
