import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LegacyHome } from "@/components/LegacyHome";

export default async function HomePage() {
  const user = await getSession();
  const dashboard = user?.role === "guru" ? "/dashboard/guru" : "/dashboard/siswa";
  const primaryHref = user ? dashboard : "/register";
  const primaryLabel = user?.role === "guru" ? "Buka dashboard guru" : user ? "Lanjutkan belajar" : "Mulai belajar";
  return <LegacyHome primaryHref={primaryHref} primaryLabel={primaryLabel} />;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Belajar matematika secara adaptif</span>
          <h1>Pahami fungsi komposisi dan invers dengan cara yang interaktif.</h1>
          <p className="lede">Pelajari konsep, bereksperimen lewat visualisasi GeoGebra, dan berlatih dengan tingkat kesulitan yang menyesuaikan kemampuanmu.</p>
          <div className="hero-actions">
            <Link className="btn-primary" href={user ? dashboard : "/register"}>{user ? "Buka dashboard" : "Mulai belajar"}</Link>
            <Link className="btn-ghost" href="/materi">Lihat materi</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="formula-card"><span>f(g(x))</span><strong>Komposisi</strong></div>
          <div className="formula-card accent"><span>f⁻¹(x)</span><strong>Invers</strong></div>
        </div>
      </section>
      <section>
        <h2 className="section-title">Satu alur belajar yang utuh</h2>
        <div className="card-grid">
          <article className="content-card"><h3>1. Pre-test</h3><p>Kenali kemampuan awal dan dapatkan jalur pembelajaran yang sesuai.</p></article>
          <article className="content-card"><h3>2. Belajar & latihan</h3><p>Pelajari materi, coba simulasi, lalu selesaikan latihan adaptif.</p></article>
          <article className="content-card"><h3>3. Post-test</h3><p>Ukur perkembangan hasil belajar setelah seluruh latihan selesai.</p></article>
        </div>
      </section>
    </>
  );
}
