import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rows, transaction } from "@/lib/db";
import type { Level } from "@/lib/constants";

type ExampleRow = Record<string, unknown> & {
  id: number; tingkat: Level; urutan: number; sub_materi: string; pertanyaan: string;
  pilihan_a: string; pilihan_b: string; pilihan_c: string; pilihan_d: string; pilihan_e: string | null;
  hint_1: string; hint_2: string; jawaban_benar: string; pembahasan: string; feedback_salah: Record<string, string>; pernah_benar: number;
};
type CountRow = Record<string, unknown> & { total:number };

const levels: Level[] = ["rendah", "sedang", "tinggi"];

async function student() {
  const user = await getSession();
  if (!user || user.role !== "siswa") return null;
  return user;
}

export async function GET(request: Request) {
  const user = await student();
  if (!user) return NextResponse.json({ error: "Masuk sebagai siswa untuk membuka contoh soal." }, { status: 401 });
  const requested = new URL(request.url).searchParams.get("level");
  const requestedPage = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1);
  const [active] = await rows<Array<Record<string, unknown> & { tingkat_saat_ini: Level | null; selesai_latihan: number }>>("SELECT tingkat_saat_ini,selesai_latihan FROM progres_latihan WHERE user_id=?", [user.id]);
  if (!active) return NextResponse.json({ error: "Selesaikan pre-test sebelum membuka contoh soal." }, { status: 403 });
  const unlocked = await rows<Array<Record<string, unknown> & { tingkat: Level }>>("SELECT tingkat FROM progres_latihan_tingkat WHERE user_id=? AND status<>'belum_dimulai' ORDER BY CASE tingkat WHEN 'rendah' THEN 1 WHEN 'sedang' THEN 2 ELSE 3 END", [user.id]);
  const unlockedLevels = unlocked.map((row) => row.tingkat);
  const level = levels.includes(requested as Level) && unlockedLevels.includes(requested as Level) ? requested as Level : active.tingkat_saat_ini ?? unlockedLevels.at(-1);
  if (!level) return NextResponse.json({ examples: [], level: null, unlockedLevels });
  try {
    const [totalRow]=await rows<CountRow[]>("SELECT COUNT(*)::int total FROM contoh_soal WHERE tingkat=? AND aktif=1",[level]);
    const [completedRow]=await rows<CountRow[]>("SELECT COUNT(*)::int total FROM progres_contoh_soal p JOIN contoh_soal c ON c.id=p.contoh_soal_id WHERE p.user_id=? AND c.tingkat=? AND p.pernah_benar=1",[user.id,level]);
    const total=totalRow?.total??0; const perPage=5; const pages=Math.max(1,Math.ceil(total/perPage)); const page=Math.min(requestedPage,pages); const offset=(page-1)*perPage;
    const examples = await rows<ExampleRow[]>(`SELECT c.id,c.tingkat,c.urutan,c.sub_materi,c.pertanyaan,c.pilihan_a,c.pilihan_b,c.pilihan_c,c.pilihan_d,c.pilihan_e,c.hint_1,c.hint_2,COALESCE(p.pernah_benar,0) pernah_benar
      FROM contoh_soal c LEFT JOIN progres_contoh_soal p ON p.contoh_soal_id=c.id AND p.user_id=?
      WHERE c.tingkat=? AND c.aktif=1 ORDER BY c.urutan,c.id LIMIT ${perPage} OFFSET ${offset}`, [user.id, level]);
    return NextResponse.json({ level, unlockedLevels, page, pages, total, completed:completedRow?.total??0, examples: examples.map(({ jawaban_benar, pembahasan, feedback_salah, ...example }) => example) });
  } catch {
    return NextResponse.json({ error: "Tabel contoh soal belum dimigrasikan. Jalankan database/neon/05_parity_schema.sql terlebih dahulu." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await student();
  if (!user) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  const body = await request.json().catch(() => null) as { exampleId?: number; answer?: string } | null;
  if (!body || !Number.isInteger(body.exampleId) || !["a", "b", "c", "d", "e"].includes(body.answer ?? "")) return NextResponse.json({ error: "Jawaban contoh soal tidak valid." }, { status: 400 });
  try {
    const [example] = await rows<ExampleRow[]>(`SELECT c.id,c.tingkat,c.jawaban_benar,c.pembahasan,c.feedback_salah
      FROM contoh_soal c JOIN progres_latihan_tingkat p ON p.user_id=? AND p.tingkat=c.tingkat AND p.status<>'belum_dimulai'
      WHERE c.id=? AND c.aktif=1`, [user.id, body.exampleId]);
    if (!example) return NextResponse.json({ error: "Contoh soal tidak ditemukan atau belum terbuka." }, { status: 404 });
    const correct = example.jawaban_benar === body.answer;
    await transaction((connection) => connection.execute(`INSERT INTO progres_contoh_soal(user_id,contoh_soal_id,jawaban_terakhir,jumlah_percobaan,pernah_benar)
      VALUES(?,?,?,1,?) ON CONFLICT(user_id,contoh_soal_id) DO UPDATE SET jawaban_terakhir=EXCLUDED.jawaban_terakhir,jumlah_percobaan=progres_contoh_soal.jumlah_percobaan+1,pernah_benar=GREATEST(progres_contoh_soal.pernah_benar,EXCLUDED.pernah_benar),terakhir_dikerjakan_pada=CURRENT_TIMESTAMP`, [user.id, example.id, body.answer, correct ? 1 : 0]));
    const feedback = correct ? "Jawaban benar. Perhatikan kembali langkah penyelesaiannya di bawah." : example.feedback_salah?.[body.answer!] ?? example.feedback_salah?.umum ?? "Jawaban belum tepat. Pelajari kembali urutan langkah pada pembahasan.";
    return NextResponse.json({ correct, correctAnswer: example.jawaban_benar, feedback, discussion: example.pembahasan });
  } catch {
    return NextResponse.json({ error: "Fitur contoh soal belum tersedia pada database ini." }, { status: 503 });
  }
}
