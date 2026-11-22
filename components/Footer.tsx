import Link from "next/link";

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-brand"><strong>Fungsiverse</strong><span>Media pembelajaran interaktif fungsi komposisi dan invers.</span></div>
    <Link className="footer-developer-link" href="/pengembang" aria-label="Lihat profil pengembang Aras Maulana Musaddad"><span className="footer-developer-avatar" aria-hidden="true">AM</span><span className="footer-developer-copy"><small>Dikembangkan oleh</small><strong>Aras Maulana Musaddad</strong></span><span className="footer-developer-arrow" aria-hidden="true">→</span></Link>
  </footer>;
}
