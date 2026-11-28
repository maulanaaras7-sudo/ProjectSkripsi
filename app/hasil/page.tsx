import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { rows } from "@/lib/db";
import { EVALUATION_QUESTIONS_PER_TEST, levelLabel } from "@/lib/constants";

interface Result extends Record<string, unknown> { nama: string; kelompok: string | null; pretest_selesai: number; posttest_selesai: number; tingkat_saat_ini: string | null; selesai_latihan: number; alasan_selesai: string | null; sesi_rendah: number; sesi_sedang: number; sesi_tinggi: number; skor_sesi: string | null; pre_benar: number | null; pre_total: number; post_benar: number | null; post_total: number; }
function completion(row: Result) { return row.selesai_latihan ? row.alasan_selesai === "batas_sesi_habis" ? "Batas sesi tercapai" : "Tuntas" : row.tingkat_saat_ini ? `Tingkat ${levelLabel(row.tingkat_saat_ini)}` : "Belum dimulai"; }
function reason(row: Result) { return row.alasan_selesai === "batas_sesi_habis" ? "Batas maksimal sesi pada tingkat aktif" : row.alasan_selesai === "lulus_tingkat_tinggi" ? "Lulus tingkat tinggi" : "—"; }

export default async function LearningResultsPage() {
  const user = await requireUser("siswa");
  const [row] = await rows<Result[]>(`SELECT u.nama,u.kelompok,u.pretest_selesai,u.posttest_selesai,p.tingkat_saat_ini,p.selesai_latihan,p.alasan_selesai,
    (SELECT COUNT(*) FROM riwayat_sesi_latihan r WHERE r.user_id=u.id AND r.tingkat='rendah' AND r.status<>'aktif') sesi_rendah,
    (SELECT COUNT(*) FROM riwayat_sesi_latihan r WHERE r.user_id=u.id AND r.tingkat='sedang' AND r.status<>'aktif') sesi_sedang,
    (SELECT COUNT(*) FROM riwayat_sesi_latihan r WHERE r.user_id=u.id AND r.tingkat='tinggi' AND r.status<>'aktif') sesi_tinggi,
    (SELECT string_agg(r.tingkat || ' S' || r.nomor_sesi || ': ' || ROUND(r.persentase)::text || '%', ' | ' ORDER BY r.id) FROM riwayat_sesi_latihan r WHERE r.user_id=u.id AND r.status<>'aktif') skor_sesi,
    SUM(CASE WHEN s.jenis='pretest' THEN js.benar ELSE 0 END)::int pre_benar,COUNT(*) FILTER (WHERE s.jenis='pretest')::int pre_total,
    SUM(CASE WHEN s.jenis='posttest' THEN js.benar ELSE 0 END)::int post_benar,COUNT(*) FILTER (WHERE s.jenis='posttest')::int post_total
    FROM users u LEFT JOIN progres_latihan p ON p.user_id=u.id LEFT JOIN jawaban_siswa js ON js.user_id=u.id LEFT JOIN soal s ON s.id=js.soal_id WHERE u.id=?
    GROUP BY u.id,p.tingkat_saat_ini,p.selesai_latihan,p.alasan_selesai`, [user.id]);
  if (!row) return <div className="panel"><p>Data hasil belajar belum tersedia.</p></div>;
  const preTotal = row.pretest_selesai ? EVALUATION_QUESTIONS_PER_TEST : row.pre_total;
  const postTotal = row.posttest_selesai ? EVALUATION_QUESTIONS_PER_TEST : row.post_total;
  const pre = preTotal ? Math.round(Number(row.pre_benar ?? 0) / preTotal * 100) : 0;
  const post = postTotal ? Math.round(Number(row.post_benar ?? 0) / postTotal * 100) : 0;
  const change = row.posttest_selesai ? post - pre : null;
  const gain = row.posttest_selesai && pre < 100 ? (post - pre) / (100 - pre) : null;
  const category = gain === null ? "—" : gain >= .7 ? "Tinggi" : gain >= .3 ? "Sedang" : "Rendah";
  const next = !row.pretest_selesai ? ["/pretest", "Mulai pre-test"] : !row.posttest_selesai ? ["/latihan", "Lanjutkan latihan"] : ["/dashboard/siswa", "Kembali ke ringkasan"];
  return <><section className="dashboard-welcome"><div><span className="eyebrow">Hasil belajar</span><h1>Perkembangan Hasil Belajar Saya</h1><p>Bandingkan evaluasi awal, proses latihan, dan evaluasi akhir Anda.</p></div><Link className="btn-ghost" href="/dashboard/siswa">Ringkasan</Link></section><section className="panel comparison-panel"><div className="panel-head"><span>Perbandingan skor (%)</span></div><div className="comparison-chart"><div className="comparison-row"><div className="comparison-name">{row.nama}</div><div className="comparison-bars"><div className="score-bar pre" style={{ width: `${pre}%` }}>Pre {pre}%</div><div className="score-bar post" style={{ width: `${post}%` }}>Post {post}%</div></div></div></div></section><div className="table-wrap"><table className="data-table training-report-table"><thead><tr><th>Kategori pre-test</th><th>Latihan</th><th>Sesi R/S/T</th><th>Skor tiap sesi</th><th>Alasan lanjut</th><th>Pre-test</th><th>Post-test</th><th>Selisih</th><th>N-Gain</th><th>Kategori</th></tr></thead><tbody><tr><td>{levelLabel(row.kelompok)}</td><td>{completion(row)}</td><td>{row.sesi_rendah}/{row.sesi_sedang}/{row.sesi_tinggi}</td><td>{row.skor_sesi ?? "—"}</td><td>{reason(row)}</td><td>{row.pretest_selesai ? `${row.pre_benar}/${preTotal} (${pre}%)` : "Belum selesai"}</td><td>{row.posttest_selesai ? `${row.post_benar}/${postTotal} (${post}%)` : "Belum selesai"}</td><td>{change === null ? "—" : `${change >= 0 ? "+" : ""}${change} poin`}</td><td>{gain === null ? "—" : gain.toFixed(2)}</td><td>{category}</td></tr></tbody></table></div><section className="guide-bottom-action"><div><strong>{row.posttest_selesai ? "Evaluasi telah lengkap" : "Langkah berikutnya"}</strong><span>{row.posttest_selesai ? "Gunakan hasil ini untuk meninjau kembali materi yang perlu diperkuat." : "Selesaikan tahapan belajar secara berurutan."}</span></div><Link className="btn-primary" href={next[0]}>{next[1]}</Link></section></>;
}
