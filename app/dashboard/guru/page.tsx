import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { rows } from "@/lib/db";

interface CountRow extends Record<string, unknown> { total_siswa: number; total_soal: number; total_jawaban: number; akurasi: number | null; }
interface GroupRow extends Record<string, unknown> { kelompok: string | null; jumlah: number; }

export default async function TeacherDashboard() {
  await requireUser("guru");
  const [stats] = await rows<CountRow[]>(`SELECT (SELECT COUNT(*) FROM users WHERE role='siswa') total_siswa,(SELECT COUNT(*) FROM soal) total_soal,(SELECT COUNT(*) FROM jawaban_siswa) total_jawaban,(SELECT ROUND(AVG(benar)*100) FROM jawaban_siswa) akurasi`);
  const groups = await rows<GroupRow[]>("SELECT kelompok,COUNT(*) jumlah FROM users WHERE role='siswa' GROUP BY kelompok ORDER BY kelompok");
  return (
    <>
      <div className="admin-heading"><div><span className="eyebrow">Area guru</span><h1>Dashboard Guru</h1><p>Pantau pembelajaran dan kelola konten Fungsiverse.</p></div></div>
      <div className="stats-grid"><div className="stat-card"><span>Total siswa</span><strong>{stats?.total_siswa ?? 0}</strong></div><div className="stat-card"><span>Bank soal</span><strong>{stats?.total_soal ?? 0}</strong></div><div className="stat-card"><span>Jawaban tersimpan</span><strong>{stats?.total_jawaban ?? 0}</strong></div><div className="stat-card"><span>Akurasi umum</span><strong>{stats?.akurasi ?? 0}%</strong></div></div>
      <div className="card-grid"><article className="content-card"><h3>Kelola materi</h3><p>Tambah atau perbarui konten pembelajaran.</p><Link className="btn-primary" href="/guru/materi">Kelola materi</Link></article><article className="content-card"><h3>Kelola soal</h3><p>Atur bank pre-test, latihan, dan post-test.</p><Link className="btn-primary" href="/guru/soal">Kelola soal</Link></article><article className="content-card"><h3>Hasil evaluasi</h3><p>Lihat ringkasan hasil setiap siswa.</p><Link className="btn-primary" href="/guru/hasil">Lihat hasil</Link></article></div>
      <section className="panel" style={{ marginTop: 28 }}><h2>Distribusi kelompok</h2><div className="stats-grid">{groups.map((g) => <div className="stat-card" key={g.kelompok ?? "belum"}><span>{g.kelompok ?? "Belum pre-test"}</span><strong>{g.jumlah}</strong></div>)}</div></section>
    </>
  );
}
