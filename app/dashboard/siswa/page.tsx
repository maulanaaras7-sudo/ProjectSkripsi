import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { rows } from "@/lib/db";
import { levelLabel } from "@/lib/constants";

interface StatusRow extends Record<string, unknown> { pretest_selesai: number; posttest_selesai: number; kelompok: string | null; }
interface ScoreRow extends Record<string, unknown> { jenis: string; jumlah: number; benar: number; skor: number | null; }
interface SessionRow extends Record<string, unknown> { tingkat: string; nomor_sesi: number; jumlah_benar: number; jumlah_soal: number; persentase: number; status: string; dikumpulkan_pada: string | null; }
interface ProgressRow extends Record<string, unknown> { tingkat_awal: string; tingkat_saat_ini: string | null; selesai_latihan: number; posttest_diizinkan: number; }
interface LevelRow extends Record<string, unknown> { tingkat: string; jumlah_sesi: number; status: string; }
interface ActivityRow extends Record<string, unknown> { waktu: string; benar: number; pertanyaan: string; }

function statusLabel(value: string) { return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()); }

export default async function StudentDashboard() {
  const user = await requireUser("siswa");
  const [[status], scores, sessions, [progress], levels, activities] = await Promise.all([
    rows<StatusRow[]>("SELECT pretest_selesai,posttest_selesai,kelompok FROM users WHERE id=?", [user.id]),
    rows<ScoreRow[]>(`SELECT s.jenis,COUNT(*) jumlah,SUM(js.benar) benar,ROUND(SUM(js.benar)::numeric/COUNT(*)*100) skor FROM jawaban_siswa js JOIN soal s ON s.id=js.soal_id WHERE js.user_id=? AND s.jenis IN ('pretest','posttest') GROUP BY s.jenis`, [user.id]),
    rows<SessionRow[]>("SELECT tingkat,nomor_sesi,jumlah_benar,jumlah_soal,persentase,status,dikumpulkan_pada FROM riwayat_sesi_latihan WHERE user_id=? AND status<>'aktif' ORDER BY id DESC LIMIT 10", [user.id]),
    rows<ProgressRow[]>("SELECT tingkat_awal,tingkat_saat_ini,selesai_latihan,posttest_diizinkan FROM progres_latihan WHERE user_id=? LIMIT 1", [user.id]),
    rows<LevelRow[]>("SELECT tingkat,jumlah_sesi,status FROM progres_latihan_tingkat WHERE user_id=? ORDER BY CASE tingkat WHEN 'rendah' THEN 1 WHEN 'sedang' THEN 2 ELSE 3 END", [user.id]),
    rows<ActivityRow[]>("SELECT js.waktu,js.benar,s.pertanyaan FROM jawaban_siswa js JOIN soal s ON s.id=js.soal_id WHERE js.user_id=? ORDER BY js.waktu DESC LIMIT 5", [user.id]),
  ]);
  const score = Object.fromEntries(scores.map((item) => [item.jenis, item.skor]));
  const next = !status?.pretest_selesai
    ? { href: "/pretest", label: "Mulai pre-test", description: "Kerjakan evaluasi awal untuk menentukan tingkat latihan Anda." }
    : status?.posttest_selesai
      ? { href: "/hasil", label: "Lihat hasil belajar", description: "Tinjau perubahan nilai dan capaian belajar Anda." }
      : progress?.posttest_diizinkan
        ? { href: "/posttest", label: "Kerjakan post-test", description: "Latihan selesai. Saatnya mengukur perkembangan pemahaman Anda." }
        : { href: "/latihan", label: "Lanjutkan latihan", description: "Pelajari materi, lalu lanjutkan sesi pada tingkat aktif Anda." };

  return <>
    <section className="dashboard-welcome"><div><span className="eyebrow">Dashboard siswa</span><h1>Halo, {user.nama}</h1><p>{next.description}</p></div><Link className="btn-primary" href={next.href}>{next.label}</Link></section>
    {progress && <><section className="training-overview dashboard-training-overview" aria-label="Ringkasan perjalanan belajar"><div><span>Kategori pre-test</span><strong>{levelLabel(progress.tingkat_awal)}</strong></div><div><span>Status latihan</span><strong>{progress.selesai_latihan ? "Selesai" : `Tingkat ${levelLabel(progress.tingkat_saat_ini)}`}</strong></div><div><span>Status post-test</span><strong>{status?.posttest_selesai ? "Selesai" : progress.posttest_diizinkan ? "Terbuka" : "Terkunci"}</strong></div><div><span>Target latihan</span><strong>80%</strong></div></section>
      <section className="level-progress-grid" aria-label="Tahap latihan">{levels.map((level) => <article className={`stat-card level-card status-${level.status}`} key={level.tingkat}><span>Tingkat {levelLabel(level.tingkat)}</span><strong>{statusLabel(level.status)}</strong><small>{level.jumlah_sesi} dari 10 sesi</small></article>)}</section></>}
    <section className="stats-grid"><article className="stat-card"><span>Nilai pre-test</span><strong>{score.pretest ?? "—"}</strong></article><article className="stat-card"><span>Tingkat awal</span><strong>{levelLabel(status?.kelompok ?? null)}</strong></article><article className="stat-card"><span>Nilai post-test</span><strong>{score.posttest ?? "—"}</strong></article></section>
    <section className="card-grid journey-grid"><article className="content-card"><span className="eyebrow">Tahap 1</span><h2>Pre-test</h2><p>{status?.pretest_selesai ? "Evaluasi awal sudah tersimpan." : "Kenali kemampuan awal sebelum memulai latihan."}</p><Link className={status?.pretest_selesai ? "btn-ghost" : "btn-primary"} href="/pretest">{status?.pretest_selesai ? "Lihat status" : "Mulai pre-test"}</Link></article><article className="content-card"><span className="eyebrow">Tahap 2</span><h2>Materi & latihan</h2><p>Pelajari konsep dan gunakan latihan adaptif untuk memperkuat pemahaman.</p><div className="hero-actions"><Link className="btn-ghost" href="/materi">Buka materi</Link>{status?.pretest_selesai && <Link className="btn-primary" href="/latihan">Buka latihan</Link>}</div></article><article className="content-card"><span className="eyebrow">Tahap 3</span><h2>Post-test</h2><p>{status?.posttest_selesai ? "Evaluasi akhir sudah selesai." : progress?.posttest_diizinkan ? "Post-test sudah tersedia." : "Terbuka setelah alur latihan selesai."}</p>{progress?.posttest_diizinkan && !status?.posttest_selesai ? <Link className="btn-primary" href="/posttest">Buka post-test</Link> : <span className="btn-ghost" aria-disabled="true">{status?.posttest_selesai ? "Selesai" : "Masih terkunci"}</span>}</article></section>
    <section className="panel dashboard-section"><h2>Aktivitas terbaru</h2>{activities.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Waktu</th><th>Soal</th><th>Hasil</th></tr></thead><tbody>{activities.map((activity, index) => <tr key={`${activity.waktu}-${index}`}><td>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(activity.waktu))}</td><td>{activity.pertanyaan}</td><td><span className={`result-pill ${activity.benar ? "is-correct" : "is-wrong"}`}>{activity.benar ? "Benar" : "Perlu diulang"}</span></td></tr>)}</tbody></table></div> : <p>Belum ada aktivitas. Mulailah dari materi atau pre-test.</p>}</section>
    <section className="panel dashboard-section"><h2>Riwayat sesi latihan</h2>{sessions.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Tingkat</th><th>Sesi</th><th>Skor</th><th>Hasil</th><th>Waktu</th></tr></thead><tbody>{sessions.map((item) => <tr key={`${item.tingkat}-${item.nomor_sesi}`}><td>{levelLabel(item.tingkat)}</td><td>{item.nomor_sesi}</td><td>{item.jumlah_benar}/{item.jumlah_soal} ({Math.round(Number(item.persentase))}%)</td><td>{statusLabel(item.status)}</td><td>{item.dikumpulkan_pada ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.dikumpulkan_pada)) : "—"}</td></tr>)}</tbody></table></div> : <p>Belum ada sesi latihan yang selesai.</p>}</section>
  </>;
}
