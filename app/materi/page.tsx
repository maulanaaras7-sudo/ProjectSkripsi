import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { rows } from "@/lib/db";
import type { MaterialRow } from "@/lib/types";
import { MaterialActivity, type Activity } from "@/components/MaterialActivity";

interface ActivityRow extends Record<string, unknown> { activity_id: number; materi_id: number; judul: string; deskripsi: string; soal_ringkas: string; step_id: number; pertanyaan: string; pilihan: string; selesai: number; }
interface StudentStatus extends Record<string, unknown> { pretest_selesai: number; kelompok: string | null; }

export default async function MaterialsPage() {
  const materials = await rows<MaterialRow[]>("SELECT id,judul,urutan,konten FROM materi ORDER BY urutan,id");
  const user = await getSession();
  if (user?.role === "siswa") {
    const [status] = await rows<StudentStatus[]>("SELECT pretest_selesai,kelompok FROM users WHERE id=?", [user.id]);
    if (!status?.pretest_selesai || !status.kelompok) redirect("/pretest");
  }
  let activities: ActivityRow[] = [];
  try { activities = await rows<ActivityRow[]>(`SELECT a.id activity_id,a.materi_id,a.judul,a.deskripsi,a.soal_ringkas,l.id step_id,l.pertanyaan,l.pilihan,COALESCE(p.selesai,0) selesai FROM aktivitas_materi a JOIN langkah_aktivitas l ON l.aktivitas_id=a.id LEFT JOIN progres_aktivitas p ON p.langkah_id=l.id AND p.user_id=? WHERE a.aktif=1 ORDER BY a.id,l.urutan`, [user?.role === "siswa" ? user.id : 0]); } catch { /* migrasi aktivitas bersifat opsional */ }
  const grouped = new Map<number, Activity & { materi_id: number }>();
  for (const row of activities) {
    if (!grouped.has(row.activity_id)) grouped.set(row.activity_id, { id: row.activity_id, materi_id: row.materi_id, judul: row.judul, deskripsi: row.deskripsi, soal_ringkas: row.soal_ringkas, steps: [] });
    const choices = JSON.parse(row.pilihan || "[]") as Array<{ value: string; label: string }>;
    grouped.get(row.activity_id)!.steps.push({ id: row.step_id, pertanyaan: row.pertanyaan, pilihan: choices, selesai: Boolean(row.selesai) });
  }
  return (
    <>
      <span className="eyebrow">Materi pembelajaran</span><h1>Fungsi, Komposisi, dan Invers</h1><p className="lede">Pelajari konsep secara berurutan, lalu gunakan visualisasi untuk menguji pemahaman.</p>
      <div className="stack">{materials.map((material, index) => <article className="panel" id={`materi-${material.id}`} key={material.id}><span className="badge">Materi {index + 1}</span><h2>{material.judul}</h2><div className="html-content" style={{ whiteSpace: "pre-wrap" }}>{material.konten}</div>{[...grouped.values()].filter((activity) => activity.materi_id === material.id).map((activity) => <MaterialActivity activity={activity} canSave={user?.role === "siswa"} key={activity.id}/>)}</article>)}</div>
    </>
  );
}
