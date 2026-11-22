"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return setMessage(data.error ?? "Permintaan gagal.");
    router.push(data.redirect ?? "/");
    router.refresh();
  }

  return (
    <form className="stack" onSubmit={submit}>
      {message && <div className="form-message" role="alert">{message}</div>}
      {mode === "register" && <div className="field"><label htmlFor="nama">Nama lengkap</label><input id="nama" name="nama" minLength={2} maxLength={100} required /></div>}
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" maxLength={100} required /></div>
      <div className="field"><label htmlFor="password">Kata sandi</label><input id="password" name="password" type="password" minLength={8} required /></div>
      {mode === "register" && <div className="field"><label htmlFor="konfirmasi">Konfirmasi kata sandi</label><input id="konfirmasi" name="konfirmasi" type="password" minLength={8} required /></div>}
      <button className="btn-primary" disabled={loading} type="submit">{loading ? "Memproses…" : mode === "login" ? "Masuk" : "Buat akun siswa"}</button>
    </form>
  );
}
