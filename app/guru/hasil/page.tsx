import { requireUser } from "@/lib/auth";
import { rows } from "@/lib/db";
import { EVALUATION_QUESTIONS_PER_TEST, levelLabel } from "@/lib/constants";

interface ResultRow extends Record<string, unknown> {
  id: number; nama: string; kelompok: string | null; pretest_selesai: number; posttest_selesai: number;
  tingkat_saat_ini: string | null; selesai_latihan: number; posttest_diizinkan: number; alasan_selesai: string | null;
  sesi_rendah: number; sesi_sedang: number; sesi_tinggi: number; skor_sesi: string | null;
  pre_benar: number | null; pre_total: number; post_benar: number | null; post_total: number;
}
function completion(row: ResultRow) { if (!row.selesai_latihan) return row.tingkat_saat_ini ? `Tingkat ${levelLabel(row.tingkat_saat_ini)}` : "Belum dimulai"; return row.alasan_selesai === "batas_sesi_habis" ? "Batas sesi tercapai" : "Tuntas"; }
function nextReason(row: ResultRow) { if (!row.alasan_selesai) return "—"; return row.alasan_selesai === "batas_sesi_habis" ? "Batas maksimal sesi pada tingkat aktif" : row.alasan_selesai === "lulus_tingkat_tinggi" ? "Lulus tingkat tinggi" : "Migrasi data lama"; }

export default async function TeacherResults() {
  await requireUser("guru");
  const data = await rows<ResultRow[]>(`SELECT u.id,u.nama,u.kelompok,u.pretest_selesai,u.posttest_selesai,
    p.tingkat_saat_ini,p.selesai_latihan,p.posttest_diizinkan,p.alasan_selesai,
    (SELECT COUNT(*) FROM riwayat_sesi_latihan r WHERE r.user_id=u.id AND r.tingkat='rendah' AND r.status<>'aktif') sesi_rendah,
    (SELECT COUNT(*) FROM riwayat_sesi_latihan r WHERE r.user_id=u.id AND r.tingkat='sedang' AND r.status<>'aktif') sesi_sedang,
    (SELECT COUNT(*) FROM riwayat_sesi_latihan r WHERE r.user_id=u.id AND r.tingkat='tinggi' AND r.status<>'aktif') sesi_tinggi,
    (SELECT string_agg(r.tingkat || ' S' || r.nomor_sesi || ': ' || ROUND(r.persentase)::text || '%', ' | ' ORDER BY r.id) FROM riwayat_sesi_latihan r WHERE r.user_id=u.id AND r.status<>'aktif') skor_sesi,
    SUM(CASE WHEN s.jenis='pretest' THEN js.benar ELSE 0 END)::int pre_benar,
    COUNT(*) FILTER (WHERE s.jenis='pretest')::int pre_total,
    SUM(CASE WHEN s.jenis='posttest' THEN js.benar ELSE 0 END)::int post_benar,
    COUNT(*) FILTER (WHERE s.jenis='posttest')::int post_total
    FROM users u LEFT JOIN progres_latihan p ON p.user_id=u.id LEFT JOIN jawaban_siswa js ON js.user_id=u.id LEFT JOIN soal s ON s.id=js.soal_id
    WHERE u.role='siswa' GROUP BY u.id,p.tingkat_saat_ini,p.selesai_latihan,p.posttest_diizinkan,p.alasan_selesai ORDER BY u.nama`);
  const mapped = data.map((row) => { const preTotal = row.pretest_selesai ? EVALUATION_QUESTIONS_PER_TEST : row.pre_total; const postTotal = row.posttest_selesai ? EVALUATION_QUESTIONS_PER_TEST : row.post_total; const pre = preTotal ? Math.round(Number(row.pre_benar ?? 0) / preTotal * 100) : 0; const post = postTotal ? Math.round(Number(row.post_benar ?? 0) / postTotal * 100) : 0; const gain = row.posttest_selesai && pre < 100 ? (post - pre) / (100 - pre) : null; const category = gain === null ? "—" : gain >= .7 ? "Tinggi" : gain >= .3 ? "Sedang" : "Rendah"; return { ...row, preTotal, postTotal, pre, post, gain, category }; });
  return <><span className="eyebrow">Laporan pembelajaran</span><h1>Perbandingan Pre-test dan Post-test</h1><p className="lede">Pantau capaian, sesi latihan, dan peningkatan setiap siswa.</p>{!mapped.length ? <div className="panel"><p>Belum ada data siswa.</p></div> : <><section className="panel comparison-panel"><div className="panel-head"><span>Perbandingan skor (%)</span></div><div className="comparison-chart">{mapped.map((row) => <div className="comparison-row" key={row.id}><div className="comparison-name">{row.nama}</div><div className="comparison-bars"><div className="score-bar pre" style={{ width: `${row.pre}%` }}>Pre {row.pre}%</div><div className="score-bar post" style={{ width: `${row.post}%` }}>Post {row.post}%</div></div></div>)}</div></section><div className="table-wrap"><table className="data-table training-report-table"><thead><tr><th>Nama siswa</th><th>Kategori pre-test</th><th>Latihan</th><th>Sesi R/S/T</th><th>Skor sesi</th><th>Alasan lanjut</th><th>Pre-test</th><th>Post-test</th><th>Selisih</th><th>N-Gain</th><th>Kategori</th></tr></thead><tbody>{mapped.map((row) => <tr key={row.id}><td><strong>{row.nama}</strong></td><td>{levelLabel(row.kelompok)}</td><td>{completion(row)}</td><td>{row.sesi_rendah}/{row.sesi_sedang}/{row.sesi_tinggi}</td><td>{row.skor_sesi ?? "—"}</td><td>{nextReason(row)}</td><td>{row.pretest_selesai ? `${row.pre_benar}/${row.preTotal} (${row.pre}%)` : "Belum selesai"}</td><td>{row.posttest_selesai ? `${row.post_benar}/${row.postTotal} (${row.post}%)` : "Belum selesai"}</td><td>{row.posttest_selesai ? `${row.post - row.pre >= 0 ? "+" : ""}${row.post - row.pre} poin` : "—"}</td><td>{row.gain === null ? "—" : row.gain.toFixed(2)}</td><td>{row.category}</td></tr>)}</tbody></table></div></>}</>;
}
