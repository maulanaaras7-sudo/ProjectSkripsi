import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, rows } from "@/lib/db";

interface StepRow extends Record<string, unknown> {
  id: number;
  jawaban_benar: string;
  feedback_benar: string;
  feedback_salah: string;
  petunjuk: string;
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "siswa") return NextResponse.json({ error: "Silakan masuk sebagai siswa." }, { status: 401 });
  const body = await request.json().catch(() => null) as { stepId?: number; answer?: string } | null;
  const stepId = Number(body?.stepId);
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
  if (!Number.isInteger(stepId) || stepId <= 0 || !answer || answer.length > 100) return NextResponse.json({ error: "Jawaban tidak valid." }, { status: 400 });
  const [step] = await rows<StepRow[]>(`SELECT l.id,l.jawaban_benar,l.feedback_benar,l.feedback_salah,l.petunjuk FROM langkah_aktivitas l JOIN aktivitas_materi a ON a.id=l.aktivitas_id WHERE l.id=? AND a.aktif=1 LIMIT 1`, [stepId]);
  if (!step) return NextResponse.json({ error: "Langkah aktivitas tidak ditemukan." }, { status: 404 });
  const correct = step.jawaban_benar.trim().toLocaleLowerCase("id") === answer.toLocaleLowerCase("id");
  await db.execute(`INSERT INTO progres_aktivitas(user_id,langkah_id,jawaban_terakhir,jumlah_percobaan,selesai,selesai_at) VALUES(?,?,?,1,?,CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END) ON CONFLICT (user_id,langkah_id) DO UPDATE SET jawaban_terakhir=EXCLUDED.jawaban_terakhir,jumlah_percobaan=progres_aktivitas.jumlah_percobaan+1,selesai_at=CASE WHEN progres_aktivitas.selesai=1 OR EXCLUDED.selesai=0 THEN progres_aktivitas.selesai_at ELSE CURRENT_TIMESTAMP END,selesai=GREATEST(progres_aktivitas.selesai,EXCLUDED.selesai)`, [user.id, stepId, answer, correct ? 1 : 0, correct ? 1 : 0]);
  return NextResponse.json({ correct, feedback: correct ? step.feedback_benar : step.feedback_salah, hint: correct ? null : step.petunjuk });
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "siswa") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const activityId = Number(new URL(request.url).searchParams.get("activityId"));
  if (!Number.isInteger(activityId) || activityId <= 0) return NextResponse.json({ error: "Aktivitas tidak valid." }, { status: 400 });
  await db.execute(`UPDATE progres_aktivitas p SET jawaban_terakhir=NULL,selesai=0,selesai_at=NULL FROM langkah_aktivitas l,aktivitas_materi a WHERE l.id=p.langkah_id AND a.id=l.aktivitas_id AND p.user_id=? AND a.id=? AND a.aktif=1`, [user.id, activityId]);
  return NextResponse.json({ success: true });
}
