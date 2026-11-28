"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MathText } from "@/components/MathText";
import { EVALUATION_DURATION_SECONDS } from "@/lib/constants";
import { EVALUATION_WARNING_SECONDS, remainingEvaluationSeconds } from "@/lib/evaluation-deadline";

type Question = { id: number; pertanyaan: string; options: Array<{ value: string; text: string }> };
const duration = EVALUATION_DURATION_SECONDS;

export function Evaluation({ kind }: { kind: "pretest" | "posttest" }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [seconds, setSeconds] = useState(duration);
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [message, setMessage] = useState("Memuat soal…");
  const [autosave, setAutosave] = useState("Menyiapkan penyimpanan jawaban…");
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);
  const retryTimer = useRef<number | null>(null);
  const draftKey = `fungsiverse-${kind}-draft`;
  const startedKey = `fungsiverse-${kind}-started-at`;

  useEffect(() => {
    fetch(`/api/evaluation/${kind}`).then(async (response) => ({ ok: response.ok, data: await response.json() })).then(async ({ ok, data }) => {
      if (!ok) throw new Error(data.error ?? "Evaluasi belum dapat dibuka.");
      setQuestions(data.questions);
      const saved = localStorage.getItem(draftKey);
      const remoteDraft = await fetch(`/api/evaluation/${kind}/draft`, { cache: "no-store" }).then(async (response) => response.ok ? (await response.json()).answers as Record<number, string> : {}).catch(() => ({} as Record<number, string>));
      const startedAt = Number(localStorage.getItem(startedKey));
      const serverDeadline = data.deadlineAt ? new Date(data.deadlineAt).getTime() : 0;
      const configuredDuration = Number(data.durationSeconds) > 0 ? Number(data.durationSeconds) : duration;
      const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      if (!startedAt && !serverDeadline) localStorage.setItem(startedKey, String(Date.now()));
      const effectiveDeadline = serverDeadline || Date.now() + Math.max(0, configuredDuration - elapsed) * 1000;
      setDeadlineMs(effectiveDeadline);
      setSeconds(remainingEvaluationSeconds(effectiveDeadline));
      if (saved || Object.keys(remoteDraft).length) {
        try { setAnswers({ ...remoteDraft, ...(saved ? JSON.parse(saved) : {}) }); setAutosave("Draf jawaban dipulihkan."); }
        catch { localStorage.removeItem(draftKey); setAutosave("Penyimpanan jawaban aktif."); }
      } else setAutosave("Penyimpanan jawaban aktif.");
      setMessage("");
    }).catch((error: Error) => setMessage(error.message));
  }, [draftKey, kind, startedKey]);

  useEffect(() => {
    if (!questions.length) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(answers));
      setAutosave("Menyimpan draf…");
      void fetch(`/api/evaluation/${kind}/draft`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) })
        .then(async (response) => {
          if (cancelled) return;
          const data = response.ok ? null : await response.json().catch(() => ({}));
          if (!cancelled) setAutosave(response.ok ? `Draf tersimpan ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.` : data?.error ?? "Draf belum tersimpan. Periksa koneksi internet.");
        })
        .catch(() => { if (!cancelled) setAutosave("Draf belum tersimpan. Periksa koneksi internet."); });
    }, 450);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [answers, draftKey, questions.length]);

  useEffect(() => {
    if (!questions.length || deadlineMs === null) return;
    const synchronize = () => setSeconds(remainingEvaluationSeconds(deadlineMs));
    synchronize();
    const timer = window.setInterval(synchronize, 1000);
    return () => window.clearInterval(timer);
  }, [deadlineMs, questions.length]);

  useEffect(() => () => {
    if (retryTimer.current !== null) window.clearTimeout(retryTimer.current);
  }, []);

  useEffect(() => {
    if (seconds === 0 && questions.length && !submitted.current) void send(true);
    // send is intentionally recreated with current answer state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, questions.length]);

  async function send(automatic = false) {
    if (submitted.current) return;
    submitted.current = true; setSubmitting(true); setMessage("");
    try {
      const response = await fetch(`/api/evaluation/${kind}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }), keepalive: true });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Jawaban gagal disimpan.");
      localStorage.removeItem(draftKey); localStorage.removeItem(startedKey);
      router.push(kind === "pretest" ? "/latihan" : "/hasil"); router.refresh();
    } catch (error) {
      submitted.current = false; setSubmitting(false);
      setMessage(error instanceof Error ? error.message : "Jawaban gagal disimpan.");
      if (automatic) retryTimer.current = window.setTimeout(() => void send(true), 5000);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered) { setMessage("Semua soal wajib dijawab sebelum evaluasi dikirim."); return; }
    await send();
  }

  const answered = Object.keys(answers).length;
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const warning = seconds > 0 && seconds <= EVALUATION_WARNING_SECONDS;
  if (!questions.length) return <div className="panel"><p>{message}</p></div>;
  return <form id="evaluation-form" onSubmit={submit}>
    {message && <div className="alert alert-danger" role="alert">{message}</div>}
    {(warning || seconds === 0) && <div className={`evaluation-deadline-warning${seconds === 0 ? " is-expired" : ""}`} role="status" aria-live="assertive"><strong>{seconds === 0 ? "Waktu habis." : "Waktu hampir habis."}</strong><span>{seconds === 0 ? "Jawaban sedang dikumpulkan otomatis. Jangan tutup halaman ini." : `Tersisa ${time}. Jawaban akan dikumpulkan otomatis saat waktu habis.`}</span></div>}
    <div className={`sticky-submit evaluation-summary${warning ? " is-warning" : ""}${seconds === 0 ? " is-expired" : ""}`}><span><strong>{answered}/{questions.length}</strong> soal dijawab <span aria-hidden="true">·</span> <span className="timer">{time}</span><small className="autosave-label">{autosave}</small></span><button className="btn-primary" disabled={submitting} type="submit">{submitting ? "Menyimpan…" : seconds === 0 ? "Kirim ulang sekarang" : "Kumpulkan jawaban"}</button></div>
    <p className="evaluation-note">Sisa waktu disimpan oleh server dan tetap berjalan ketika halaman dimuat ulang atau dibuka dari perangkat lain. Saat waktu habis, sistem mengumpulkan draf secara otomatis dan jawaban yang belum dipilih dihitung salah.</p>
    {questions.map((question, index) => <article className="question-card" key={question.id}><span className="question-number">Soal {index + 1} dari {questions.length}</span><p className="question-text"><MathText>{question.pertanyaan}</MathText></p><div className="question-options">{question.options.map((option, optionIndex) => <label className="question-option" key={option.value}><input type="radio" name={`q-${question.id}`} value={option.value} checked={answers[question.id] === option.value} onChange={() => setAnswers((value) => ({ ...value, [question.id]: option.value }))} /><span><strong>{String.fromCharCode(65 + optionIndex)}.</strong> <MathText>{option.text}</MathText></span></label>)}</div></article>)}
  </form>;
}
