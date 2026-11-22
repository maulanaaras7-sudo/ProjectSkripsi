"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MathText } from "@/components/MathText";

type Question = { id: number; pertanyaan: string; options: Array<{ value: string; text: string }> };
const duration = 60 * 60;

export function Evaluation({ kind }: { kind: "pretest" | "posttest" }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [seconds, setSeconds] = useState(duration);
  const [message, setMessage] = useState("Memuat soal…");
  const [autosave, setAutosave] = useState("Menyiapkan penyimpanan jawaban…");
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);
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
      const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      if (!startedAt && !serverDeadline) localStorage.setItem(startedKey, String(Date.now()));
      setSeconds(serverDeadline ? Math.max(0, Math.ceil((serverDeadline - Date.now()) / 1000)) : Math.max(0, duration - elapsed));
      if (saved || Object.keys(remoteDraft).length) {
        try { setAnswers({ ...remoteDraft, ...(saved ? JSON.parse(saved) : {}) }); setAutosave("Draf jawaban dipulihkan."); }
        catch { localStorage.removeItem(draftKey); setAutosave("Penyimpanan jawaban aktif."); }
      } else setAutosave("Penyimpanan jawaban aktif.");
      setMessage("");
    }).catch((error: Error) => setMessage(error.message));
  }, [draftKey, kind, startedKey]);

  useEffect(() => {
    if (!questions.length) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(answers));
      void fetch(`/api/evaluation/${kind}/draft`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) });
      setAutosave(`Tersimpan ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [answers, draftKey, questions.length]);

  useEffect(() => {
    if (!questions.length || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [questions.length, seconds]);

  useEffect(() => {
    if (seconds === 0 && questions.length && !submitted.current) void send();
    // send is intentionally recreated with current answer state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, questions.length]);

  async function send() {
    if (submitted.current) return;
    submitted.current = true; setSubmitting(true); setMessage("");
    const response = await fetch(`/api/evaluation/${kind}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers }) });
    const data = await response.json();
    if (!response.ok) { submitted.current = false; setSubmitting(false); setMessage(data.error ?? "Jawaban gagal disimpan."); return; }
    localStorage.removeItem(draftKey); localStorage.removeItem(startedKey);
    router.push(kind === "pretest" ? "/latihan" : "/hasil"); router.refresh();
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
  if (!questions.length) return <div className="panel"><p>{message}</p></div>;
  return <form id="evaluation-form" onSubmit={submit}>
    {message && <div className="alert alert-danger" role="alert">{message}</div>}
    <div className="sticky-submit evaluation-summary"><span><strong>{answered}/{questions.length}</strong> soal dijawab <span aria-hidden="true">·</span> <span className="timer">{time}</span><small className="autosave-label">{autosave}</small></span><button className="btn-primary" disabled={submitting} type="submit">{submitting ? "Menyimpan…" : "Kumpulkan jawaban"}</button></div>
    <p className="evaluation-note">Sisa waktu disimpan oleh server dan tetap berjalan ketika halaman dimuat ulang atau dibuka dari perangkat lain. Jawaban yang belum dipilih dihitung salah saat dikumpulkan.</p>
    {questions.map((question, index) => <article className="question-card" key={question.id}><span className="question-number">Soal {index + 1} dari {questions.length}</span><p className="question-text"><MathText>{question.pertanyaan}</MathText></p><div className="question-options">{question.options.map((option, optionIndex) => <label className="question-option" key={option.value}><input type="radio" name={`q-${question.id}`} value={option.value} checked={answers[question.id] === option.value} onChange={() => setAnswers((value) => ({ ...value, [question.id]: option.value }))} /><span><strong>{String.fromCharCode(65 + optionIndex)}.</strong> <MathText>{option.text}</MathText></span></label>)}</div></article>)}
  </form>;
}
