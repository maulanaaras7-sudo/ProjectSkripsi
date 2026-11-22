import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  if (await getSession()) redirect("/");
  const query = await searchParams;
  return <section className="panel auth-card"><h1>Masuk kelas</h1><p>Masuk untuk mengakses materi, simulasi, dan latihan.</p>{query.registered === "1" && <div className="alert alert-success">Akun berhasil dibuat. Silakan masuk.</div>}<AuthForm mode="login" /><p className="auth-switch">Belum punya akun? <Link href="/register">Daftar di sini</Link>.</p><p className="auth-help"><Link href="/panduan#umum">Baru pertama kali? Baca panduan singkat</Link></p></section>;
}
