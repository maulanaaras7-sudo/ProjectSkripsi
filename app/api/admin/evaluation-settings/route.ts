import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { transaction } from "@/lib/db";
import { evaluationDurations } from "@/lib/evaluation-settings";
import {
  MAX_EVALUATION_DURATION_MINUTES,
  MIN_EVALUATION_DURATION_MINUTES,
} from "@/lib/constants";

const duration = z.coerce.number().int().min(MIN_EVALUATION_DURATION_MINUTES).max(MAX_EVALUATION_DURATION_MINUTES);
const schema = z.object({ pretest: duration, posttest: duration });

export async function GET() {
  const user = await getSession();
  if (user?.role !== "guru") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  return NextResponse.json({ durations: await evaluationDurations() });
}

export async function PUT(request: Request) {
  const user = await getSession();
  if (user?.role !== "guru") return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `Durasi harus berupa bilangan bulat ${MIN_EVALUATION_DURATION_MINUTES}–${MAX_EVALUATION_DURATION_MINUTES} menit.` }, { status: 400 });

  await transaction(async (connection) => {
    for (const kind of ["pretest", "posttest"] as const) {
      await connection.execute(
        "INSERT INTO evaluation_settings(jenis,durasi_menit,diperbarui_pada,diperbarui_oleh) VALUES(?,?,CURRENT_TIMESTAMP,?) ON CONFLICT(jenis) DO UPDATE SET durasi_menit=EXCLUDED.durasi_menit,diperbarui_pada=CURRENT_TIMESTAMP,diperbarui_oleh=EXCLUDED.diperbarui_oleh",
        [kind, parsed.data[kind], user.id],
      );
    }
  });
  return NextResponse.json({ ok: true, durations: parsed.data });
}
