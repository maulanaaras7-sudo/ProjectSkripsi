import { ProfileForm } from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth";
import { rows } from "@/lib/db";

interface ProfileRow extends Record<string, unknown> { nama: string; email: string; role: "guru" | "siswa" }

export default async function ProfilePage() {
  const session = await requireUser();
  const [profile] = await rows<ProfileRow[]>("SELECT nama,email,role FROM users WHERE id=?", [session.id]);
  if (!profile) return <section className="panel"><p>Akun tidak ditemukan.</p></section>;
  return <>
    <section className="dashboard-welcome"><div><span className="eyebrow">Pengaturan akun</span><h1>Edit Profil</h1><p>Perbarui nama, email, atau kata sandi akun {profile.role === "guru" ? "guru" : "siswa"} Anda.</p></div></section>
    <ProfileForm initialName={profile.nama} initialEmail={profile.email} />
  </>;
}
