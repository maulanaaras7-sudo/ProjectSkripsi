import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UserRow } from "@/lib/types";

const schema = z.object({
  nama: z.string().trim().min(2).max(100),
  email: z.email().max(100),
  currentPassword: z.string().min(1).max(200),
  newPassword: z.union([z.literal(""), z.string().min(6).max(200)]).optional(),
});

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data profil tidak valid." }, { status: 400 });

  const [user] = await db.execute<UserRow>("SELECT * FROM users WHERE id=?", [session.id]);
  if (!user) return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
  if (!(await bcrypt.compare(parsed.data.currentPassword, user.password))) return NextResponse.json({ error: "Kata sandi saat ini salah." }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const [duplicate] = await db.execute<{ id: number }>("SELECT id FROM users WHERE email=? AND id<>? LIMIT 1", [email, user.id]);
  if (duplicate) return NextResponse.json({ error: "Email sudah digunakan akun lain." }, { status: 409 });

  const password = parsed.data.newPassword ? await bcrypt.hash(parsed.data.newPassword, 12) : user.password;
  await db.execute("UPDATE users SET nama=?,email=?,password=? WHERE id=?", [parsed.data.nama, email, password, user.id]);
  await createSession({ id: user.id, nama: parsed.data.nama, email, role: user.role, kelompok: user.kelompok });
  return NextResponse.json({ ok: true, user: { nama: parsed.data.nama, email } });
}
