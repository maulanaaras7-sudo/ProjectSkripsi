import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { rows } from "@/lib/db";
import type { UserRow } from "@/lib/types";

const schema = z.object({ email: z.email().max(100), password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Email atau kata sandi tidak valid." }, { status: 400 });
  const users = await rows<UserRow[]>("SELECT * FROM users WHERE email = ? LIMIT 1", [parsed.data.email.toLowerCase()]);
  const user = users[0];
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }
  await createSession({ id: user.id, nama: user.nama, email: user.email, role: user.role, kelompok: user.kelompok });
  return NextResponse.json({ ok: true, redirect: user.role === "guru" ? "/dashboard/guru" : "/dashboard/siswa" });
}
