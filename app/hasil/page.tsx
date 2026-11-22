import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { rows } from "@/lib/db";
import { levelLabel } from "@/lib/constants";

interface UserStatus extends Record<string, unknown> { kelompok: string | null; pretest_selesai: number; posttest_selesai: number }
interface Score extends Record<string, unknown> { jenis: string; benar: number; total: number; skor: number }
interface Session extends Record<string, unknown> { jumlah_benar: number; jumlah_soal: number; persentase: number; status: string }

export default async function LearningResultsPage() {
  const user = await requireUser("siswa");
  const [[status], scores, sessions] = await Promise.all([
    rows<UserStatus[]>("SELECT kelompok,pretest_selesai,posttest_selesai FROM users WHERE id=?", [user.id]),
    rows<Score[]>(`SELECT s.jenis,SUM(js.benar) benar,COUNT(*) total,ROUND(SUM(js.benar)::numeric / COUNT(*) * 100) skor FROM jawaban_siswa js JOIN soal s ON s.id=js.soal_id WHERE js.user_id=? AND s.jenis IN ('pretest','posttest') GROUP BY s.jenis`, [user.id]),
    rows<Session[]>("SELECT jumlah_benar,jumlah_soal,persentase,status FROM riwayat_sesi_latihan WHERE user_id=? AND status<>'aktif' ORDER BY id", [user.id]),
  ]);
  const score = Object.fromEntries(scores.map((item) => [item.jenis, item]));
  const change = score.pretest && score.posttest ? score.posttest.skor - score.pretest.skor : null;
  const nGain = score.pretest && score.posttest && score.pretest.skor < 100 ? (score.posttest.skor - score.pretest.skor) / (100 - score.pretest.skor) : null;
  const nGainCategory = nGain === null ? "—" : nGain >= .7 ? "Tinggi" : nGain >= .3 ? "Sedang" : "Rendah";
  const averageTraining = sessions.length ? Math.round(sessions.reduce((sum, item) => sum + Number(item.persentase), 0) / sessions.length) : null;
  return <>
    <section className="dashboard-welcome"><div><span className="eyebrow">Hasil belajar</span><h1>Perkembangan {user.nama}</h1><p>Ringkasan ini membantu Anda melihat perubahan dari evaluasi awal hingga akhir.</p></div><Link className="btn-ghost" href="/dashboard/siswa">Kembali ke dashboard</Link></section>
    <section className="stats-grid"><article className="stat-card"><span>Kelompok awal</span><strong>{levelLabel(status?.kelompok ?? null)}</strong></article><article className="stat-card"><span>Nilai pre-test</span><strong>{score.pretest?.skor ?? "—"}</strong></article><article className="stat-card"><span>Nilai post-test</span><strong>{score.posttest?.skor ?? "—"}</strong></article><article className="stat-card"><span>Perubahan</span><strong>{change === null ? "—" : `${change > 0 ? "+" : ""}${change}`}</strong></article><article className="stat-card"><span>N-Gain</span><strong>{nGain === null ? "—" : nGain.toFixed(2)}</strong><small>{nGainCategory}</small></article></section>
    <section className="card-grid"><article className="content-card"><span className="eyebrow">Evaluasi awal</span><h2>Pre-test</h2><p>{score.pretest ? `${score.pretest.benar} dari ${score.pretest.total} jawaban benar.` : "Pre-test belum dikerjakan."}</p><span className="score-display">{score.pretest?.skor ?? "—"}</span></article><article className="content-card"><span className="eyebrow">Proses belajar</span><h2>Latihan adaptif</h2><p>{sessions.length ? `${sessions.length} sesi telah diselesaikan dengan rata-rata ${averageTraining}%.` : "Belum ada sesi latihan yang selesai."}</p><span className="score-display">{sessions.length}</span></article><article className="content-card"><span className="eyebrow">Evaluasi akhir</span><h2>Post-test</h2><p>{score.posttest ? `${score.posttest.benar} dari ${score.posttest.total} jawaban benar.` : "Post-test belum dikerjakan atau belum terbuka."}</p><span className="score-display">{score.posttest?.skor ?? "—"}</span></article></section>
    {!status?.posttest_selesai && <section className="panel dashboard-section"><h2>Langkah berikutnya</h2><p>{status?.pretest_selesai ? "Lanjutkan latihan sampai post-test terbuka." : "Mulai dari pre-test agar sistem dapat menentukan tingkat latihan yang tepat."}</p><Link className="btn-primary" href={status?.pretest_selesai ? "/latihan" : "/pretest"}>{status?.pretest_selesai ? "Lanjutkan latihan" : "Mulai pre-test"}</Link></section>}
  </>;
}
