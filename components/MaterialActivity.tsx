"use client";

import { useMemo, useState } from "react";

type Step = {
  id: number;
  pertanyaan: string;
  pilihan: Array<{ value: string; label: string }>;
  selesai: boolean;
};

export type Activity = {
  id: number;
  judul: string;
  deskripsi: string;
  soal_ringkas: string;
  steps: Step[];
};

export function MaterialActivity({ activity, canSave }: { activity: Activity; canSave: boolean }) {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState(activity.steps);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, { text: string; hint?: string }>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const completed = useMemo(() => steps.filter((step) => step.selesai).length, [steps]);

  async function check(step: Step, index: number) {
    if (!canSave || !answers[step.id] || busy !== null || (index > 0 && !steps[index - 1].selesai)) return;
    setBusy(step.id);
    const response = await fetch("/api/material-activities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stepId: step.id, answer: answers[step.id] }),
    });
    const data = await response.json();
    if (response.ok) {
      setFeedback((value) => ({ ...value, [step.id]: { text: data.feedback, hint: data.hint } }));
      if (data.correct) setSteps((value) => value.map((item) => item.id === step.id ? { ...item, selesai: true } : item));
    } else {
      setFeedback((value) => ({ ...value, [step.id]: { text: data.error ?? "Jawaban gagal diperiksa." } }));
    }
    setBusy(null);
  }

  async function reset() {
    if (busy !== null) return;
    setBusy(-1);
    const response = await fetch(`/api/material-activities?activityId=${activity.id}`, { method: "DELETE" });
    if (response.ok) {
      setSteps((value) => value.map((step) => ({ ...step, selesai: false })));
      setAnswers({});
      setFeedback({});
    }
    setBusy(null);
  }

  return <div className="material-activity">
    <button type="button" className="btn-primary" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      {open ? "Tutup aktivitas" : "Belajar interaktif"}
    </button>
    {open && <section className="activity-panel">
      <div className="activity-heading"><div><span className="eyebrow">Latihan terbimbing</span><h3>{activity.judul}</h3></div><strong>{completed}/{steps.length} langkah selesai</strong></div>
      <p>{activity.deskripsi} Setiap langkah harus diselesaikan secara berurutan.</p>
      <div className="activity-problem"><span>Soal yang akan diselesaikan</span><strong>{activity.soal_ringkas}</strong></div>
      {!canSave ? <div className="alert">Masuk sebagai siswa agar jawaban dan progres tersimpan.</div> : <>
        <div className="progress-track"><span style={{ width: `${steps.length ? completed / steps.length * 100 : 0}%` }} /></div>
        {steps.map((step, index) => {
          const locked = index > 0 && !steps[index - 1].selesai;
          return <article className={`activity-step ${step.selesai ? "is-complete" : ""}`} key={step.id}>
            <strong>Langkah {index + 1} dari {steps.length}{step.selesai ? " ✓" : ""}</strong>
            <p>{step.pertanyaan}</p>
            <div className="question-options">{step.pilihan.map((option) => <label className="question-option" key={option.value}><input type="radio" name={`step-${step.id}`} value={option.value} disabled={locked || step.selesai} checked={answers[step.id] === option.value} onChange={() => setAnswers((value) => ({ ...value, [step.id]: option.value }))}/><span>{option.label}</span></label>)}</div>
            <button type="button" className="btn-primary" disabled={locked || step.selesai || !answers[step.id] || busy !== null} onClick={() => check(step, index)}>{step.selesai ? "Sudah selesai" : busy === step.id ? "Memeriksa…" : "Periksa jawaban"}</button>
            {feedback[step.id] && <div className="alert"><strong>{feedback[step.id].text}</strong>{feedback[step.id].hint && <p>Petunjuk: {feedback[step.id].hint}</p>}</div>}
          </article>;
        })}
        {completed === steps.length && <div className="activity-finish"><strong>Aktivitas selesai!</strong><span> Anda telah menyelesaikan “{activity.judul}”.</span><button type="button" className="btn-ghost" disabled={busy !== null} onClick={reset}>Ulangi aktivitas</button></div>}
      </>}
    </section>}
  </div>;
}
