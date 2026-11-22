import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  return <section className="panel auth-card"><h1>Masuk ke Fungsiverse</h1><p>Gunakan akun siswa atau guru Anda.</p><AuthForm mode="login" /><p>Belum punya akun? <Link href="/register">Daftar sebagai siswa</Link>.</p></section>;
}
