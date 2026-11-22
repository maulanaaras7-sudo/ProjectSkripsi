import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({ nama: z.string().trim().min(2).max(100), email: z.email().max(100), password: z.string().min(8).max(200), konfirmasi: z.string() }).refine((v) => v.password === v.konfirmasi, { message: "Konfirmasi kata sandi tidak sama." });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  const { nama, email, password } = parsed.data;
  try {
    const [result] = await db.execute<{ id: number }>("INSERT INTO users (nama,email,password,role) VALUES (?,?,?,'siswa') RETURNING id", [nama, email.toLowerCase(), await bcrypt.hash(password, 12)]);
    const id = Number(result.id);
    await createSession({ id, nama, email: email.toLowerCase(), role: "siswa", kelompok: null });
    return NextResponse.json({ ok: true, redirect: "/dashboard/siswa" }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    throw error;
  }
}
