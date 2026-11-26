"use client";

import Link from "next/link";
import { useState } from "react";
import { MathText } from "@/components/MathText";

type Role = "guru" | "siswa" | undefined;

const flow = [
  ["Pelajari materi", "Membaca konsep dasar fungsi, komposisi, dan invers."],
  ["Eksplorasi GeoGebra", "Menggeser nilai dan mengamati perubahan grafik secara langsung."],
  ["Kerjakan latihan", "Menyelesaikan soal komposisi dan invers dengan umpan balik instan."],
  ["Lihat hasil", "Meninjau capaian belajar dan area yang masih perlu diperkuat."],
];

function audience(role: Role) {
  if (role === "guru") return { title: "Bantuan untuk mengelola pembelajaran", guide: "/panduan#guru", guideLabel: "Panduan guru", links: [["/panduan#guru", "Panduan guru", "Cara mengelola pembelajaran"], ["/guru/materi", "Kelola materi", "Tambah atau perbaiki materi"], ["/guru/soal", "Kelola soal", "Periksa bank soal"]] };
  if (role === "siswa") return { title: "Bantuan untuk melanjutkan belajar", guide: "/panduan#siswa", guideLabel: "Panduan siswa", links: [["/panduan#siswa", "Panduan siswa", "Lihat urutan belajar"], ["/materi", "Pelajari materi", "Baca konsep dan contoh"], ["/latihan", "Kerjakan latihan", "Lanjutkan tingkat aktif"]] };
  return { title: "Panduan sebelum membuat akun", guide: "/panduan#umum", guideLabel: "Lihat panduan", links: [["/panduan#umum", "Panduan umum", "Cara menggunakan Fungsiverse"], ["/register", "Buat akun", "Daftar sebagai siswa atau guru"], ["/login", "Masuk", "Untuk pengguna yang sudah terdaftar"]] };
}

export function LegacyHome({ primaryHref, primaryLabel, userRole }: { primaryHref: string; primaryLabel: string; userRole?: Role }) {
  const menu = audience(userRole);
  const [c, setC] = useState(-2);
  const curve = `M 60 ${300 - c * 8} Q 200 ${40 - c * 12} 340 ${300 - c * 8}`;

  return <>
    <section className="hero">
      <div>
        <span className="eyebrow">Kelas XI · Fungsi Komposisi dan Invers</span>
        <h1>Lihat langsung bagaimana <em>f</em> bertemu <em>g</em>, lalu dibalik lagi.</h1>
        <p className="lede">Pelajari fungsi komposisi dan invers melalui materi singkat, grafik interaktif, serta latihan yang menyesuaikan kemampuan Anda.</p>
        <div className="cta-row"><Link className="btn-primary" href={primaryHref}>{primaryLabel}</Link><Link className="btn-ghost" href={menu.guide}>{menu.guideLabel}</Link></div>
        <div className="algebra-card">
          <h4>Tampilan aljabar</h4>
          <div className="row"><span className="dot" style={{ background: "var(--curve-f)" }} /><MathText className="mono">\\(f(x) = 2x + 1\\)</MathText></div>
          <div className="row"><span className="dot" style={{ background: "var(--curve-g)" }} /><MathText className="mono">{`\\(g(x) = x^{2} - ${Math.abs(c)}\\)`}</MathText><input aria-label="Nilai c" type="range" min="-4" max="4" step="1" value={c} onChange={(event) => setC(Number(event.target.value))} /></div>
          <div className="row"><span className="dot" style={{ background: "var(--ink)" }} /><MathText className="mono">{`\\((f\\circ g)(x) = 2(x^{2}-${Math.abs(c)})+1\\)`}</MathText></div>
        </div>
      </div>
      <div className="panel home-preview-graph">
        <div className="panel-head"><span>Tampilan grafik</span><div className="legend"><span><i style={{ background: "var(--curve-f)" }} />f(x)</span><span><i style={{ background: "var(--curve-g)" }} />g(x)</span><span><i style={{ background: "var(--ink)" }} />y = x</span></div></div>
        <svg viewBox="0 0 400 340" role="img" aria-label="Pratinjau grafik fungsi"><line x1="20" y1="170" x2="380" y2="170" stroke="var(--line)" /><line x1="200" y1="10" x2="200" y2="330" stroke="var(--line)" /><line x1="30" y1="320" x2="370" y2="20" stroke="var(--ink)" strokeDasharray="4 4" opacity=".55" /><path d="M 40 300 L 360 60" stroke="var(--curve-f)" strokeWidth="2.5" fill="none" /><path d={curve} stroke="var(--curve-g)" strokeWidth="2.5" fill="none" /><path d="M 300 340 Q 40 220 40 20" stroke="var(--curve-g)" strokeWidth="2" fill="none" strokeDasharray="3 4" opacity=".6" /></svg>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8 }}>Pratinjau statis. Buka <Link href="/visualisasi">Simulasi GeoGebra</Link> untuk eksplorasi interaktif penuh.</p>
      </div>
    </section>
    <section className="audience-strip"><div><span className="eyebrow">Mulai dari sini</span><h2>{menu.title}</h2></div><div className="audience-links">{menu.links.map(([href, title, description]) => <Link href={href} key={href}><strong>{title}</strong><span>{description}</span><b>→</b></Link>)}</div></section>
    <section className="modules"><Link className="mcard module-link" href="/materi"><div className="micon">▤</div><h3>Materi</h3><p>Penjelasan konsep fungsi, komposisi, dan invers secara bertahap, disertai contoh dan ilustrasi visual pada setiap sub-materi.</p></Link><Link className="mcard module-link" href="/visualisasi"><div className="micon">⌁</div><h3>Simulasi GeoGebra</h3><p>Geser nilai koefisien dan konstanta, lalu amati perubahan grafik fungsi dan invers secara langsung.</p></Link><Link className="mcard module-link" href="/latihan"><div className="micon">✓</div><h3>Latihan &amp; evaluasi</h3><p>Soal latihan dengan umpan balik langsung, serta ringkasan hasil belajar yang dapat dipantau peserta didik dan guru.</p></Link></section>
    <section className="flow" id="alur-belajar"><h2>Alur belajar di Fungsiverse</h2><div className="steps">{flow.map(([title, description], index) => <div className="step" key={title}><div className="stepnum">{index + 1}</div><h3>{title}</h3><p>{description}</p></div>)}</div></section>
  </>;
}
