"use client";

import { useState } from "react";

export interface ManagedStudent extends Record<string, unknown> {
  id: number;
  nama: string;
  email: string;
  total_jawaban: number;
}

export function StudentAccountManager({ initialStudents }: { initialStudents: ManagedStudent[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function remove(student: ManagedStudent) {
    const confirmed = window.confirm(`Hapus akun ${student.nama} (${student.email})? Semua jawaban dan progres siswa ini akan dihapus permanen.`);
    if (!confirmed) return;
    setDeleting(student.id);
    setMessage("");
    const response = await fetch(`/api/admin/students/${student.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setDeleting(null);
    setError(!response.ok);
    setMessage(response.ok ? `Akun ${student.nama} berhasil dihapus.` : data.error ?? "Akun siswa gagal dihapus.");
    if (response.ok) setStudents((current) => current.filter((item) => item.id !== student.id));
  }

  return <section className="panel dashboard-section">
    <div className="panel-head"><span>Kelola akun siswa</span></div>
    <p className="field-help">Penghapusan bersifat permanen dan mencakup jawaban, progres, sesi latihan, serta draf evaluasi siswa.</p>
    {message && <div className={`alert${error ? " alert-danger" : ""}`} role="status">{message}</div>}
    <div className="table-wrap"><table className="data-table">
      <thead><tr><th>Nama</th><th>Email</th><th>Jawaban tersimpan</th><th>Aksi</th></tr></thead>
      <tbody>{students.length ? students.map((student) => <tr key={student.id}>
        <td><strong>{student.nama}</strong></td><td>{student.email}</td><td>{student.total_jawaban}</td>
        <td><button className="danger-button" disabled={deleting === student.id} onClick={() => void remove(student)} type="button">{deleting === student.id ? "Menghapus…" : "Hapus akun"}</button></td>
      </tr>) : <tr><td colSpan={4}>Belum ada akun siswa.</td></tr>}</tbody>
    </table></div>
  </section>;
}
