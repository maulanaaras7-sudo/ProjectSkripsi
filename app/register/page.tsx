import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  if (await getSession()) redirect("/");
  return <section className="panel auth-card"><h1>Buat akun</h1><p>Buat akun siswa untuk mulai belajar.</p><AuthForm mode="register" /><p className="field-help">Registrasi publik hanya tersedia untuk akun siswa. Akun guru dibuat melalui prosedur administratif.</p><p className="auth-switch">Sudah punya akun? <Link href="/login">Masuk di sini</Link>.</p><p className="auth-help"><Link href="/panduan#umum">Baca panduan sebelum mendaftar</Link></p></section>;
}
