import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

interface StudentTarget extends Record<string, unknown> {
  id: number;
  nama: string;
  email: string;
  role: "guru" | "siswa";
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const teacher = await getSession();
  if (teacher?.role !== "guru") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "ID siswa tidak valid." }, { status: 400 });

  const [target] = await db.execute<StudentTarget>("SELECT id,nama,email,role FROM users WHERE id=?", [id]);
  if (!target) return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
  if (target.role !== "siswa") return NextResponse.json({ error: "Hanya akun siswa yang dapat dihapus dari menu ini." }, { status: 400 });

  await db.execute("DELETE FROM users WHERE id=? AND role='siswa'", [id]);
  return NextResponse.json({ ok: true, deleted: { id: target.id, nama: target.nama } });
}
