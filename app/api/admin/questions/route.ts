import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  id: z.coerce.number().int().nonnegative(), materi_id: z.coerce.number().int().nonnegative().default(0),
  jenis: z.enum(["pretest", "latihan", "posttest"]), tingkat_kesulitan: z.enum(["rendah", "sedang", "tinggi"]),
  pertanyaan: z.string().trim().min(1), pilihan_a: z.string().trim().min(1), pilihan_b: z.string().trim().min(1), pilihan_c: z.string().trim().min(1), pilihan_d: z.string().trim().min(1), pilihan_e: z.string().trim().min(1),
  jawaban_benar: z.enum(["a", "b", "c", "d", "e"]), pembahasan: z.string().trim().optional(),
  aktif: z.coerce.number().int().refine((value) => value === 0 || value === 1),
});
type Existing = Record<string, string | number | boolean | null>;

export async function POST(request: Request) {
  const user = await getSession();
  if (user?.role !== "guru") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const value = parsed.data;
  const materiId = value.materi_id || null;
  if (materiId && !(await db.execute<{ id: number }>("SELECT id FROM materi WHERE id=?", [materiId]))[0]) return NextResponse.json({ error: "Materi terkait tidak ditemukan." }, { status: 400 });
  const immutable = { materi_id: materiId, jenis: value.jenis, tingkat_kesulitan: value.tingkat_kesulitan, pertanyaan: value.pertanyaan, pilihan_a: value.pilihan_a, pilihan_b: value.pilihan_b, pilihan_c: value.pilihan_c, pilihan_d: value.pilihan_d, pilihan_e: value.pilihan_e, jawaban_benar: value.jawaban_benar, pembahasan: value.pembahasan || null };
  const args = [materiId, value.jenis, value.tingkat_kesulitan, value.pertanyaan, value.pilihan_a, value.pilihan_b, value.pilihan_c, value.pilihan_d, value.pilihan_e, value.jawaban_benar, value.pembahasan || null, value.aktif];
  if (value.id) {
    const [existing] = await db.execute<Existing>("SELECT s.*, (EXISTS(SELECT 1 FROM jawaban_siswa WHERE soal_id=s.id) OR EXISTS(SELECT 1 FROM sesi_latihan_soal WHERE soal_id=s.id)) used FROM soal s WHERE s.id=?", [value.id]);
    if (!existing) return NextResponse.json({ error: "Soal tidak ditemukan." }, { status: 404 });
    const unchanged = Object.entries(immutable).every(([key, field]) => String(existing[key] ?? "") === String(field ?? ""));
    if (existing.used && !unchanged) return NextResponse.json({ error: "Soal memiliki riwayat pengerjaan. Untuk menjaga skor historis, hanya status aktif yang boleh diubah." }, { status: 409 });
    await db.execute("UPDATE soal SET materi_id=?,jenis=?,tingkat_kesulitan=?,pertanyaan=?,pilihan_a=?,pilihan_b=?,pilihan_c=?,pilihan_d=?,pilihan_e=?,jawaban_benar=?,pembahasan=?,aktif=? WHERE id=?", [...args, value.id]);
  } else await db.execute("INSERT INTO soal(materi_id,jenis,tingkat_kesulitan,pertanyaan,pilihan_a,pilihan_b,pilihan_c,pilihan_d,pilihan_e,jawaban_benar,pembahasan,aktif) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", args);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (user?.role !== "guru") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
  await db.execute("UPDATE soal SET aktif=0 WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
}
