"use client";

import { useState, type FormEvent } from "react";
import {
  MAX_EVALUATION_DURATION_MINUTES,
  MIN_EVALUATION_DURATION_MINUTES,
} from "@/lib/constants";

type Durations = { pretest: number; posttest: number };

export function EvaluationTimerSettings({ initialDurations }: { initialDurations: Durations }) {
  const [durations, setDurations] = useState(initialDurations);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/evaluation-settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(durations),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "Pengaturan waktu gagal disimpan.");
      return;
    }
    setDurations(data.durations);
    setMessage("Durasi evaluasi berhasil disimpan.");
  }

  return <section className="panel">
    <div className="panel-head"><span>Durasi pengerjaan</span></div>
    <form className="stack" onSubmit={save}>
      {message && <div className="alert" role="status">{message}</div>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="pretest-duration">Durasi pretest (menit)</label>
          <input id="pretest-duration" type="number" min={MIN_EVALUATION_DURATION_MINUTES} max={MAX_EVALUATION_DURATION_MINUTES} required value={durations.pretest} onChange={(event) => setDurations((current) => ({ ...current, pretest: Number(event.target.value) }))} />
        </div>
        <div className="field">
          <label htmlFor="posttest-duration">Durasi posttest (menit)</label>
          <input id="posttest-duration" type="number" min={MIN_EVALUATION_DURATION_MINUTES} max={MAX_EVALUATION_DURATION_MINUTES} required value={durations.posttest} onChange={(event) => setDurations((current) => ({ ...current, posttest: Number(event.target.value) }))} />
        </div>
      </div>
      <p className="field-help">Durasi dapat diatur antara {MIN_EVALUATION_DURATION_MINUTES}–{MAX_EVALUATION_DURATION_MINUTES} menit. Perubahan berlaku saat siswa memulai evaluasi baru.</p>
      <div className="hero-actions"><button className="btn-primary" disabled={saving} type="submit">{saving ? "Menyimpan…" : "Simpan durasi"}</button></div>
    </form>
  </section>;
}
