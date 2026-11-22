import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";

export default async function RegisterPage() {
  if (await getSession()) redirect("/");
  return <section className="panel auth-card"><h1>Daftar akun siswa</h1><p>Buat akun untuk menyimpan progres belajar.</p><AuthForm mode="register" /><p>Sudah punya akun? <Link href="/login">Masuk</Link>.</p></section>;
}
