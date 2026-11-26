import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { evaluationQuestions } from "@/lib/evaluation";
import { EvaluationBlueprintError } from "@/lib/evaluation-selection";
import { rows, transaction } from "@/lib/db";

const options = new Set(["a", "b", "c", "d", "e"]);
function validKind(value: string): value is "pretest" | "posttest" { return value === "pretest" || value === "posttest"; }
function key(kind: string, userId: number) { return `assessment-v1:${kind}:user:${userId}`; }

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const user = await getSession();
  const { kind } = await params;
  if (!user || user.role !== "siswa") return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  if (!validKind(kind)) return NextResponse.json({ error: "Jenis evaluasi tidak valid." }, { status: 404 });
  try {
    const saved = await rows<Array<Record<string, unknown> & { soal_id: number; jawaban_dipilih: string }>>("SELECT d.soal_id,d.jawaban_dipilih FROM draft_jawaban_evaluasi d JOIN soal s ON s.id=d.soal_id WHERE d.user_id=? AND d.attempt_key=? AND d.jenis=? AND s.jenis=?", [user.id, key(kind, user.id), kind, kind]);
    return NextResponse.json({ answers: Object.fromEntries(saved.map((item) => [item.soal_id, item.jawaban_dipilih])) });
  } catch {
    return NextResponse.json({ answers: {}, available: false });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const user = await getSession();
  const { kind } = await params;
  if (!user || user.role !== "siswa") return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  if (!validKind(kind)) return NextResponse.json({ error: "Jenis evaluasi tidak valid." }, { status: 404 });
  const body = await request.json().catch(() => null) as { answers?: Record<string, string> } | null;
  if (!body?.answers || typeof body.answers !== "object") return NextResponse.json({ error: "Draf jawaban tidak valid." }, { status: 400 });
  let permitted: Set<number>;
  try {
    permitted = new Set((await evaluationQuestions(user.id, kind)).map((question) => question.id));
  } catch (error) {
    if (!(error instanceof EvaluationBlueprintError)) throw error;
    console.error("assessment-blueprint-shortage", { kind, missingSlots: error.missingSlots });
    return NextResponse.json({ error: "Bank evaluasi belum memenuhi kisi-kisi.", code: error.code }, { status: 503 });
  }
  const entries = Object.entries(body.answers).filter(([id, answer]) => permitted.has(Number(id)) && options.has(answer));
  try {
    await transaction(async (connection) => {
      for (const [questionId, answer] of entries) await connection.execute(`INSERT INTO draft_jawaban_evaluasi(user_id,attempt_key,jenis,soal_id,jawaban_dipilih, diperbarui_pada)
        VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(user_id,attempt_key,soal_id) DO UPDATE SET jawaban_dipilih=EXCLUDED.jawaban_dipilih,diperbarui_pada=CURRENT_TIMESTAMP`, [user.id, key(kind, user.id), kind, Number(questionId), answer]);
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, available: false });
  }
}
