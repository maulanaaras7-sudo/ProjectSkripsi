import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function Header() {
  const user = await getSession();
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" href="/">
          <span className="brand-mark">ƒ</span>
          <span>Fungsiverse</span>
        </Link>
        <nav className="site-nav" aria-label="Navigasi utama">
          <Link href="/materi">Materi</Link>
          <Link href="/visualisasi">Visualisasi</Link>
          {user?.role === "siswa" && <Link href="/dashboard/siswa">Dashboard</Link>}
          {user?.role === "guru" && <Link href="/dashboard/guru">Dashboard Guru</Link>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <span className="nav-name">{user.nama}</span>
              <form action="/api/auth/logout" method="post">
                <button className="btn-small" type="submit">Keluar</button>
              </form>
            </>
          ) : (
            <Link className="btn-small" href="/login">Masuk</Link>
          )}
        </div>
      </div>
    </header>
  );
}
