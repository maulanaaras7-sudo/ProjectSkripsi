"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ExamplePractice } from "@/components/ExamplePractice";
import { MathText } from "@/components/MathText";

type Level = "rendah" | "sedang" | "tinggi";
type Question = { id: number; pertanyaan: string; pilihan_a: string; pilihan_b: string; pilihan_c: string; pilihan_d: string; pilihan_e: string | null };
type Session = { id: number; tingkat: Level; nomor_sesi: number; status: string };
type Progress = { tingkat_awal: Level; tingkat_saat_ini: Level | null; selesai_latihan: number; posttest_diizinkan: number };
type LevelProgress = { tingkat: Level; jumlah_sesi: number; status: string };
type Result = { correct: number; total: number; percentage: number; message: string };
const labels: Record<Level, string> = { rendah: "Rendah", sedang: "Sedang", tinggi: "Tinggi" };

export function Training() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("Memuat progres latihan…");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/training", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "Latihan belum dapat dimuat."); return; }
    setProgress(data.progress); setLevels(data.levels ?? []); setSession(data.session); setQuestions(data.questions ?? []); setAnswers({}); setMessage("");
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function start() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/training", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "start" }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(data.error ?? "Sesi belum dapat dimulai."); return; }
    setSession(data.session); setQuestions(data.questions); setAnswers({});
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || busy) return;
    if (Object.keys(answers).length !== questions.length) { setMessage("Jawab seluruh soal sebelum mengumpulkan sesi."); return; }
    setBusy(true); setMessage("");
    const response = await fetch("/api/training", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "submit", sessionId: session.id, answers }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setMessage(data.error ?? "Sesi gagal dinilai."); return; }
    setResult(data); setSession(null); setQuestions([]); await load(); router.refresh();
  }

  if (!progress && message) return <div className="panel"><p>{message}</p></div>;
  const activeLevel = progress?.tingkat_saat_ini;
  return <>
    {message && <div className="alert alert-danger" role="alert">{message}</div>}
    {progress && <section className="training-overview" aria-label="Ringkasan latihan">
      <div><span>Tingkat awal</span><strong>{labels[progress.tingkat_awal]}</strong></div>
      <div><span>Tingkat aktif</span><strong>{activeLevel ? labels[activeLevel] : "Selesai"}</strong></div>
      <div><span>Sesi tingkat ini</span><strong>{activeLevel ? `${levels.find((item) => item.tingkat === activeLevel)?.jumlah_sesi ?? 0} dari 10` : "—"}</strong></div>
      <div><span>Target kelulusan</span><strong>80%</strong></div>
    </section>}
    {levels.length > 0 && <section className="level-progress-grid" aria-label="Progres tiap tingkat">{levels.map((item) => <article className={`stat-card level-card status-${item.status}`} key={item.tingkat}><span>Tingkat {labels[item.tingkat]}</span><strong>{item.status.replaceAll("_", " ")}</strong><small>{item.jumlah_sesi} dari 10 sesi</small></article>)}</section>}
    {result && <section className="panel session-result"><span className="eyebrow">Hasil sesi</span><h2>{result.correct}/{result.total} benar · {result.percentage}%</h2><p>{result.message}</p></section>}
    {!progress?.selesai_latihan && <ExamplePractice activeLevel={activeLevel ?? null} />}
    {progress?.selesai_latihan ? <section className="panel training-complete"><span className="eyebrow">Latihan selesai</span><h2>Post-test sudah terbuka</h2><p>Selesaikan evaluasi akhir untuk melihat perkembangan belajar Anda.</p><a className="btn-primary" href="/posttest">Lanjut ke post-test</a></section> : session ? <form onSubmit={submit}>
      <section className="session-heading"><div><span className="eyebrow">Tingkat {labels[session.tingkat]}</span><h2>Sesi {session.nomor_sesi} dari 10</h2></div><span>{questions.length} soal · Target 80%</span></section>
      {questions.map((question, index) => <article className="question-card" key={question.id}><span className="question-number">Soal {index + 1} dari {questions.length}</span><p className="question-text"><MathText>{question.pertanyaan}</MathText></p><div className="question-options">{(["a", "b", "c", "d", "e"] as const).map((key, optionIndex) => question[`pilihan_${key}`] ? <label className="question-option" key={key}><input type="radio" name={`q-${question.id}`} value={key} checked={answers[question.id] === key} onChange={() => setAnswers((value) => ({ ...value, [question.id]: key }))} /><span><strong>{String.fromCharCode(65 + optionIndex)}.</strong> <MathText>{question[`pilihan_${key}`] ?? ""}</MathText></span></label> : null)}</div></article>)}
      <div className="sticky-submit"><span><strong>{Object.keys(answers).length}/{questions.length}</strong> soal dijawab</span><button className="btn-primary" disabled={busy} type="submit">{busy ? "Menilai…" : "Kumpulkan sesi"}</button></div>
    </form> : <section className="panel session-launch"><span className="eyebrow">Siap berlatih?</span><h2>Tingkat {activeLevel ? labels[activeLevel] : "—"}</h2><p>Setiap sesi berisi 10 soal. Jawab seluruh soal sebelum dikumpulkan; progres baru berubah setelah sesi dinilai.</p><button className="btn-primary" type="button" disabled={busy} onClick={start}>{busy ? "Menyiapkan…" : `Mulai sesi ${(levels.find((item) => item.tingkat === activeLevel)?.jumlah_sesi ?? 0) + 1}`}</button></section>}
  </>;
}
