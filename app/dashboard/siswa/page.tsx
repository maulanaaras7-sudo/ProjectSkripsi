import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { rows } from "@/lib/db";
import { levelLabel } from "@/lib/constants";

interface StatusRow extends Record<string, unknown> { pretest_selesai: number; posttest_selesai: number; kelompok: string | null; }
interface ScoreRow extends Record<string, unknown> { jenis: string; jumlah: number; benar: number; skor: number | null; }
interface SessionRow extends Record<string, unknown> { tingkat: string; nomor_sesi: number; persentase: number; status: string; }
interface ProgressRow extends Record<string, unknown> { posttest_diizinkan: number; }

export default async function StudentDashboard() {
  const user = await requireUser("siswa");
  const [status] = await rows<StatusRow[]>("SELECT pretest_selesai,posttest_selesai,kelompok FROM users WHERE id=?", [user.id]);
  const scores = await rows<ScoreRow[]>(`SELECT s.jenis,COUNT(*) jumlah,SUM(js.benar) benar,ROUND(SUM(js.benar)/COUNT(*)*100) skor FROM jawaban_siswa js JOIN soal s ON s.id=js.soal_id WHERE js.user_id=? AND s.jenis IN ('pretest','posttest') GROUP BY s.jenis`, [user.id]);
  const sessions = await rows<SessionRow[]>("SELECT tingkat,nomor_sesi,persentase,status FROM riwayat_sesi_latihan WHERE user_id=? AND status<>'aktif' ORDER BY id DESC LIMIT 6", [user.id]);
  const [progress] = await rows<ProgressRow[]>("SELECT posttest_diizinkan FROM progres_latihan WHERE user_id=? LIMIT 1", [user.id]);
  const score = Object.fromEntries(scores.map((item) => [item.jenis, item.skor]));
  return (
    <>
      <div className="admin-heading"><div><span className="eyebrow">Dashboard siswa</span><h1>Halo, {user.nama}</h1><p>Ikuti tahap pembelajaran secara berurutan.</p></div><span className={`badge level-${status?.kelompok ?? "rendah"}`}>Kelompok {levelLabel(status?.kelompok ?? null)}</span></div>
      <div className="stats-grid">
        <div className="stat-card"><span>Nilai pre-test</span><strong>{score.pretest ?? "—"}</strong></div>
        <div className="stat-card"><span>Tingkat awal</span><strong>{levelLabel(status?.kelompok ?? null)}</strong></div>
        <div className="stat-card"><span>Nilai post-test</span><strong>{score.posttest ?? "—"}</strong></div>
      </div>
      <section className="card-grid">
        <article className="content-card"><h3>1. Pre-test</h3><p>{status?.pretest_selesai ? "Sudah selesai." : "Kerjakan evaluasi kemampuan awal."}</p><Link className={status?.pretest_selesai ? "btn-ghost" : "btn-primary"} href="/pretest">{status?.pretest_selesai ? "Lihat status" : "Mulai pre-test"}</Link></article>
        <article className="content-card"><h3>2. Materi & latihan</h3><p>Pelajari materi lalu kerjakan latihan yang menyesuaikan tingkatmu.</p><div className="hero-actions"><Link className="btn-ghost" href="/materi">Buka materi</Link>{status?.pretest_selesai ? <Link className="btn-primary" href="/latihan">Buka latihan</Link> : null}</div></article>
        <article className="content-card"><h3>3. Post-test</h3><p>{status?.posttest_selesai ? "Sudah selesai." : progress?.posttest_diizinkan ? "Post-test sudah tersedia." : "Post-test tersedia setelah alur latihan selesai."}</p>{progress?.posttest_diizinkan && !status?.posttest_selesai ? <Link className="btn-primary" href="/posttest">Buka post-test</Link> : <span className="btn-ghost" aria-disabled="true">{status?.posttest_selesai ? "Selesai" : "Masih terkunci"}</span>}</article>
      </section>
      <section className="panel" style={{ marginTop: 28 }}><h2>Riwayat latihan terbaru</h2>{sessions.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Tingkat</th><th>Sesi</th><th>Nilai</th><th>Status</th></tr></thead><tbody>{sessions.map((s) => <tr key={`${s.tingkat}-${s.nomor_sesi}`}><td>{levelLabel(s.tingkat)}</td><td>{s.nomor_sesi}</td><td>{Number(s.persentase)}%</td><td>{s.status.replaceAll("_", " ")}</td></tr>)}</tbody></table></div> : <p>Belum ada sesi latihan.</p>}</section>
    </>
  );
}
