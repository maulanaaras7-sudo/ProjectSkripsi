import Link from "next/link";
import { getSession } from "@/lib/auth";
import { PrimaryNavigation } from "@/components/PrimaryNavigation";

export async function Header() {
  const user = await getSession();
  const initial = user?.nama.trim().charAt(0).toUpperCase();

  return <header className="site-header">
    <div className="logo"><Link href="/" className="brand-link"><b>Fungsiverse</b><span>Belajar fungsi dengan lebih mudah</span></Link></div>
    <PrimaryNavigation role={user?.role ?? null} />
    <div className="account-actions">
      {user ? <><div className="user-chip"><span className="user-avatar" aria-hidden="true">{initial}</span><span><strong>{user.nama}</strong><small>{user.role === "guru" ? "Guru" : "Siswa"}</small></span></div><form action="/api/auth/logout" method="post"><button className="btn-small" type="submit">Keluar</button></form></> : <><Link className="btn-small" href="/login">Masuk</Link><Link className="pill" href="/register">Daftar</Link></>}
    </div>
  </header>;
}
