import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { rows } from "@/lib/db";
import type { MaterialRow } from "@/lib/types";
import { MaterialActivity, type Activity } from "@/components/MaterialActivity";
import { MaterialContent } from "@/components/MaterialContent";

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
      <h1 className="section-title">Materi Fungsi Komposisi &amp; Invers</h1>
      <section className="learning-goals" aria-labelledby="tujuan-pembelajaran"><h2 id="tujuan-pembelajaran">Tujuan Pembelajaran</h2><p>Setelah mempelajari materi fungsi komposisi dan invers melalui Fungsiverse, peserta didik diharapkan mampu mencapai tujuan berikut.</p><ol><li>Menjelaskan konsep fungsi serta menentukan domain, kodomain, dan range sebagai pengetahuan prasyarat.</li><li>Menentukan komposisi dua fungsi atau lebih serta menjelaskan urutan dan sifatnya.</li><li>Menentukan syarat suatu fungsi memiliki invers dan menentukan fungsi invers secara aljabar.</li><li>Menganalisis hubungan fungsi dan invers melalui representasi aljabar dan grafik.</li><li>Menganalisis hubungan antara fungsi komposisi dan fungsi invers.</li><li>Menggunakan fungsi komposisi dan invers dalam permasalahan kontekstual.</li></ol></section>
      <div>{materials.map((material) => <article className="materi-card" id={`materi-${material.id}`} key={material.id}><h2>{material.urutan}. {material.judul}</h2><div className="konten"><MaterialContent content={material.konten}/></div>{[...grouped.values()].filter((activity) => activity.materi_id === material.id).map((activity) => <MaterialActivity activity={activity} canSave={user?.role === "siswa"} key={activity.id}/>)}</article>)}</div><div className="cta-row"><Link href="/visualisasi" className="btn-primary">Coba di simulasi GeoGebra</Link><Link href="/latihan" className="btn-ghost">Uji pemahaman</Link></div>
    </>
  );
}
