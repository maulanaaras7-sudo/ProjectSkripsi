import { EvaluationTimerSettings } from "@/components/EvaluationTimerSettings";
import { StudentAccountManager, type ManagedStudent } from "@/components/StudentAccountManager";
import { requireUser } from "@/lib/auth";
import { rows } from "@/lib/db";
import { evaluationDurations } from "@/lib/evaluation-settings";

interface ActiveAttempt extends Record<string, unknown> {
  jenis: "pretest" | "posttest";
  jumlah: number;
}

export default async function TeacherSettingsPage() {
  await requireUser("guru");
  const [durations, activeAttempts, students] = await Promise.all([
    evaluationDurations(),
    rows<ActiveAttempt[]>("SELECT jenis,COUNT(*)::int jumlah FROM evaluation_attempts WHERE deadline_pada>CURRENT_TIMESTAMP GROUP BY jenis"),
    rows<ManagedStudent[]>("SELECT u.id,u.nama,u.email,COUNT(js.id)::int total_jawaban FROM users u LEFT JOIN jawaban_siswa js ON js.user_id=u.id WHERE u.role='siswa' GROUP BY u.id ORDER BY u.nama,u.id"),
  ]);
  const active = Object.fromEntries(activeAttempts.map((item) => [item.jenis, item.jumlah]));

  return <>
    <section className="dashboard-welcome">
      <div><span className="eyebrow">Ruang administrasi</span><h1>Pengaturan Guru</h1><p>Atur waktu evaluasi dan kelola akun siswa dari satu halaman.</p></div>
    </section>
    <EvaluationTimerSettings initialDurations={durations} />
    <section className="panel dashboard-section">
      <h2>Percobaan yang sudah dimulai</h2>
      <p>Pretest aktif: <strong>{active.pretest ?? 0}</strong> · Posttest aktif: <strong>{active.posttest ?? 0}</strong></p>
      <p className="field-help">Tenggat siswa yang sudah memulai tidak diubah. Pengaturan baru digunakan ketika percobaan berikutnya dibuat.</p>
    </section>
    <StudentAccountManager initialStudents={students} />
  </>;
}
