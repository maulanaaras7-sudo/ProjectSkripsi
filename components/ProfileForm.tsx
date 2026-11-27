"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function ProfileForm({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmation = String(form.get("passwordConfirmation") ?? "");
    if (newPassword !== confirmation) {
      setError(true);
      setMessage("Konfirmasi kata sandi baru tidak sama.");
      return;
    }

    setSaving(true);
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nama: form.get("nama"),
        email: form.get("email"),
        currentPassword: form.get("currentPassword"),
        newPassword,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    setError(!response.ok);
    setMessage(response.ok ? "Profil berhasil diperbarui." : data.error ?? "Profil gagal diperbarui.");
    if (response.ok) {
      formElement.reset();
      const name = formElement.elements.namedItem("nama") as HTMLInputElement | null;
      const email = formElement.elements.namedItem("email") as HTMLInputElement | null;
      if (name) name.value = data.user.nama;
      if (email) email.value = data.user.email;
      router.refresh();
    }
  }

  return <form className="panel stack" onSubmit={save}>
    {message && <div className={`alert${error ? " alert-danger" : ""}`} role="status">{message}</div>}
    <div className="form-grid">
      <div className="field"><label htmlFor="profile-name">Nama lengkap</label><input id="profile-name" name="nama" minLength={2} maxLength={100} required defaultValue={initialName} /></div>
      <div className="field"><label htmlFor="profile-email">Email</label><input id="profile-email" name="email" type="email" maxLength={100} required defaultValue={initialEmail} /></div>
    </div>
    <div className="field"><label htmlFor="current-password">Kata sandi saat ini</label><input id="current-password" name="currentPassword" type="password" required autoComplete="current-password" /><small className="field-help">Diperlukan untuk mengonfirmasi perubahan profil.</small></div>
    <div className="form-grid">
      <div className="field"><label htmlFor="new-password">Kata sandi baru</label><input id="new-password" name="newPassword" type="password" minLength={6} autoComplete="new-password" /><small className="field-help">Kosongkan jika tidak ingin mengganti kata sandi.</small></div>
      <div className="field"><label htmlFor="password-confirmation">Ulangi kata sandi baru</label><input id="password-confirmation" name="passwordConfirmation" type="password" minLength={6} autoComplete="new-password" /></div>
    </div>
    <div className="hero-actions"><button className="btn-primary" disabled={saving} type="submit">{saving ? "Menyimpan…" : "Simpan profil"}</button></div>
  </form>;
}
