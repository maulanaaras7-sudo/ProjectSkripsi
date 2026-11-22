import Link from "next/link";

export function LegacyHome({ primaryHref, primaryLabel }: { primaryHref: string; primaryLabel: string }) {
  return <>
    <section className="hero">
      <div>
        <span className="eyebrow">Kelas XI &middot; Fungsi Komposisi dan Invers</span>
        <h1>Lihat langsung bagaimana <em>f</em> bertemu <em>g</em>, lalu dibalik lagi.</h1>
        <p className="lede">Pelajari fungsi komposisi dan invers melalui materi singkat, grafik interaktif, serta latihan yang menyesuaikan kemampuan Anda.</p>
        <div className="cta-row"><Link className="btn-primary" href={primaryHref}>{primaryLabel}</Link><Link className="btn-ghost" href="/materi">Lihat materi</Link></div>
        <div className="algebra-card"><h4>Tampilan aljabar</h4><div className="row"><span className="dot" style={{ background: "var(--curve-f)" }} /><span className="mono">f(x) = 2x + 1</span></div><div className="row"><span className="dot" style={{ background: "var(--curve-g)" }} /><span className="mono">g(x) = x² − 2</span></div><div className="row"><span className="dot" style={{ background: "var(--ink)" }} /><span className="mono">(f∘g)(x) = 2(x²−2)+1</span></div></div>
      </div>
      <div className="panel">
        <div className="panel-head"><span>Tampilan grafik</span><div className="legend"><span><i style={{ background: "var(--curve-f)" }} />f(x)</span><span><i style={{ background: "var(--curve-g)" }} />g(x)</span><span><i style={{ background: "var(--ink)" }} />y = x</span></div></div>
        <svg viewBox="0 0 400 340" role="img" aria-label="Pratinjau grafik fungsi"><line x1="20" y1="170" x2="380" y2="170" stroke="var(--line)" strokeWidth="1" /><line x1="200" y1="10" x2="200" y2="330" stroke="var(--line)" strokeWidth="1" /><line x1="30" y1="320" x2="370" y2="20" stroke="var(--ink)" strokeWidth="1" strokeDasharray="4 4" opacity=".55" /><path d="M 40 300 L 360 60" stroke="var(--curve-f)" strokeWidth="2.5" fill="none" /><path d="M 60 300 Q 200 40 340 300" stroke="var(--curve-g)" strokeWidth="2.5" fill="none" /><path d="M 300 340 Q 40 220 40 20" stroke="var(--curve-g)" strokeWidth="2" fill="none" strokeDasharray="3 4" opacity=".6" /></svg>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8 }}>Pratinjau statis. Buka <Link href="/visualisasi">Simulasi GeoGebra</Link> untuk eksplorasi interaktif penuh.</p>
      </div>
    </section>
    <section className="audience-strip"><div><span className="eyebrow">Mulai dari sini</span><h2>Panduan sebelum membuat akun</h2></div><div className="audience-links"><Link href="/materi"><strong>Pelajari materi</strong><span>Mulai dari konsep dasar fungsi</span><b>→</b></Link><Link href="/register"><strong>Buat akun</strong><span>Daftar sebagai siswa</span><b>→</b></Link><Link href="/login"><strong>Masuk</strong><span>Untuk pengguna terdaftar</span><b>→</b></Link></div></section>
    <section className="modules"><Link className="mcard module-link" href="/materi"><div className="micon" style={{ background: "#E6F1FB", color: "#0C447C" }}>▤</div><h3>Materi</h3><p>Penjelasan konsep fungsi, komposisi, dan invers secara bertahap, disertai contoh dan ilustrasi visual.</p></Link><Link className="mcard module-link" href="/visualisasi"><div className="micon" style={{ background: "#FBEAD1", color: "#5C3A0B" }}>⌁</div><h3>Simulasi GeoGebra</h3><p>Amati perubahan grafik fungsi, komposisi, dan invers secara langsung dan interaktif.</p></Link><Link className="mcard module-link" href="/latihan"><div className="micon" style={{ background: "#E1F5EE", color: "#0C3B2E" }}>✓</div><h3>Latihan &amp; evaluasi</h3><p>Soal adaptif dengan umpan balik langsung serta ringkasan hasil belajar.</p></Link></section>
    <section className="flow"><h2>Alur belajar di Fungsiverse</h2><div className="steps"><div className="step"><div className="stepnum">1</div><h4>Pelajari materi</h4><p>Membaca konsep dasar fungsi, komposisi, dan invers.</p></div><div className="step"><div className="stepnum">2</div><h4>Eksplorasi GeoGebra</h4><p>Mengamati perubahan grafik secara langsung.</p></div><div className="step"><div className="stepnum">3</div><h4>Kerjakan latihan</h4><p>Menyelesaikan soal dengan umpan balik instan.</p></div><div className="step"><div className="stepnum">4</div><h4>Lihat hasil</h4><p>Meninjau capaian belajar dan area yang perlu diperkuat.</p></div></div></section>
  </>;
}
