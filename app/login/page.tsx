import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  if (await getSession()) redirect("/");
  const query = await searchParams;
  return <section className="panel auth-card"><h1>Masuk kelas</h1><p>Masuk untuk mengakses materi, simulasi, dan latihan.</p>{query.registered === "1" && <div className="alert alert-success">Akun berhasil dibuat. Silakan masuk.</div>}<div className="registration-guide"><div><strong>Baru menggunakan Fungsiverse?</strong><span>Buat akun siswa terlebih dahulu agar dapat mulai belajar.</span></div><Link href="/register">Daftar akun baru</Link></div><AuthForm mode="login" /><p className="auth-switch">Belum punya akun? <Link href="/register">Daftar di sini</Link>.</p><p className="auth-help"><Link href="/panduan#umum">Baca panduan penggunaan Fungsiverse</Link></p></section>;
}
