import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function Header() {
  const user = await getSession();
  const initial = user?.nama.trim().charAt(0).toUpperCase();
  return <header className="site-header">
    <div className="nav-wrap">
      <Link className="brand" href="/"><span className="brand-mark">F</span><span>Fungsiverse</span></Link>
      <nav className="site-nav" aria-label="Navigasi utama">
        {!user && <Link href="/">Beranda</Link>}
        {user?.role === "siswa" && <Link href="/dashboard/siswa">Ringkasan</Link>}
        <Link href="/materi">Materi</Link>
        <Link href="/visualisasi">Simulasi</Link>
        <Link href="/panduan">Bantuan</Link>
        {user?.role === "siswa" && <><Link href="/latihan">Latihan</Link><Link href="/hasil">Hasil belajar</Link></>}
        {user?.role === "guru" && <><Link href="/dashboard/guru">Dashboard guru</Link><Link href="/guru/hasil">Hasil siswa</Link></>}
      </nav>
      <div className="nav-user">
        {user ? <><div className="user-chip"><span className="user-avatar" aria-hidden="true">{initial}</span><span><strong>{user.nama}</strong><small>{user.role === "guru" ? "Guru" : "Siswa"}</small></span></div><form action="/api/auth/logout" method="post"><button className="btn-small" type="submit">Keluar</button></form></> : <><Link className="btn-small" href="/login">Masuk</Link><Link className="pill" href="/register">Daftar</Link></>}
      </div>
    </div>
  </header>;
}
