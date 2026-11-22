import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rows, transaction } from "@/lib/db";
import { LEVELS, TRAINING_MAX_SESSIONS_PER_LEVEL, TRAINING_PASS_PERCENTAGE, TRAINING_QUESTIONS_PER_SESSION, type Level } from "@/lib/constants";

interface FreshUser extends Record<string, unknown> { id: number; kelompok: Level | null; pretest_selesai: number }
interface Progress extends Record<string, unknown> { tingkat_saat_ini: Level | null; selesai_latihan: number; posttest_diizinkan: number }
interface SessionRow extends Record<string, unknown> { id: number; tingkat: Level; nomor_sesi: number; status: string }
interface TrainingQuestion extends Record<string, unknown> { id: number; pertanyaan: string; pilihan_a: string; pilihan_b: string; pilihan_c: string; pilihan_d: string; pilihan_e: string | null; jawaban_benar: string }
interface IdRow extends Record<string, unknown> { id: number }
interface CountRow extends Record<string, unknown> { total: string | number }
interface LevelRow extends Record<string, unknown> { tingkat_saat_ini: Level }

async function loadQuestions(sessionId: number) {
  return rows<TrainingQuestion[]>(`SELECT s.id,s.pertanyaan,s.pilihan_a,s.pilihan_b,s.pilihan_c,s.pilihan_d,s.pilihan_e,s.jawaban_benar FROM sesi_latihan_soal x JOIN soal s ON s.id=x.soal_id WHERE x.sesi_id=? ORDER BY x.urutan`, [sessionId]);
}

export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "siswa") return NextResponse.json({ error: "Silakan masuk sebagai siswa." }, { status: 401 });
  const [fresh] = await rows<FreshUser[]>("SELECT id,kelompok,pretest_selesai FROM users WHERE id=?", [user.id]);
  if (!fresh?.pretest_selesai || !fresh.kelompok) return NextResponse.json({ error: "Selesaikan pre-test sebelum membuka latihan." }, { status: 403 });

  const initialLevel = fresh.kelompok;
  await transaction(async (connection) => {
    await connection.execute("INSERT INTO progres_latihan(user_id,tingkat_awal,tingkat_saat_ini) VALUES(?,?,?) ON CONFLICT (user_id) DO NOTHING", [user.id, initialLevel, initialLevel]);
    for (const level of LEVELS) {
      await connection.execute("INSERT INTO progres_latihan_tingkat(user_id,tingkat,status) VALUES(?,?,?) ON CONFLICT (user_id,tingkat) DO NOTHING", [user.id, level, level === initialLevel ? "berjalan" : LEVELS.indexOf(level) < LEVELS.indexOf(initialLevel) ? "dilewati" : "belum_dimulai"]);
    }
  });

  const [progress] = await rows<Progress[]>("SELECT tingkat_saat_ini,selesai_latihan,posttest_diizinkan FROM progres_latihan WHERE user_id=?", [user.id]);
  if (progress.selesai_latihan) return NextResponse.json({ completed: true });

  let [active] = await rows<SessionRow[]>("SELECT id,tingkat,nomor_sesi,status FROM riwayat_sesi_latihan WHERE user_id=? AND status='aktif' ORDER BY id DESC LIMIT 1", [user.id]);
  if (!active) {
    active = await transaction(async (connection) => {
      const [levelRow] = await connection.query<LevelRow>("SELECT tingkat_saat_ini FROM progres_latihan WHERE user_id=? FOR UPDATE", [user.id]);
      const level = levelRow.tingkat_saat_ini;
      const [countRow] = await connection.query<CountRow>("SELECT COUNT(*) total FROM riwayat_sesi_latihan WHERE user_id=? AND tingkat=?", [user.id, level]);
      const number = Number(countRow.total) + 1;
      const [inserted] = await connection.query<IdRow>("INSERT INTO riwayat_sesi_latihan(user_id,tingkat,nomor_sesi,jumlah_soal,status) VALUES(?,?,?,?,'aktif') RETURNING id", [user.id, level, number, TRAINING_QUESTIONS_PER_SESSION]);
      let chosen = await connection.query<IdRow>(`SELECT s.id FROM soal s WHERE s.jenis='latihan' AND s.tingkat_kesulitan=? AND s.aktif=1 AND NOT EXISTS(SELECT 1 FROM sesi_latihan_soal x JOIN riwayat_sesi_latihan r ON r.id=x.sesi_id WHERE r.user_id=? AND x.soal_id=s.id) ORDER BY RANDOM() LIMIT ${TRAINING_QUESTIONS_PER_SESSION}`, [level, user.id]);
      if (chosen.length < TRAINING_QUESTIONS_PER_SESSION) chosen = await connection.query<IdRow>(`SELECT id FROM soal WHERE jenis='latihan' AND tingkat_kesulitan=? AND aktif=1 ORDER BY RANDOM() LIMIT ${TRAINING_QUESTIONS_PER_SESSION}`, [level]);
      if (!chosen.length) throw new Error(`Bank latihan tingkat ${level} kosong.`);
      for (let index = 0; index < chosen.length; index++) await connection.execute("INSERT INTO sesi_latihan_soal(sesi_id,soal_id,urutan) VALUES(?,?,?)", [inserted.id, chosen[index].id, index + 1]);
      await connection.execute("UPDATE riwayat_sesi_latihan SET jumlah_soal=? WHERE id=?", [chosen.length, inserted.id]);
      return { id: inserted.id, tingkat: level, nomor_sesi: number, status: "aktif" } as SessionRow;
    });
  }

  const questions = await loadQuestions(active.id);
  return NextResponse.json({ session: active, questions: questions.map(({ jawaban_benar, ...question }) => question) });
}

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || user.role !== "siswa") return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  const body = await request.json().catch(() => null) as { sessionId?: number; answers?: Record<string, string> } | null;
  if (!body?.sessionId) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 400 });
  const questions = await loadQuestions(body.sessionId);
  if (!questions.length) return NextResponse.json({ error: "Soal sesi tidak ditemukan." }, { status: 404 });
  const [session] = await rows<SessionRow[]>("SELECT id,tingkat,nomor_sesi,status FROM riwayat_sesi_latihan WHERE id=? AND user_id=?", [body.sessionId, user.id]);
  if (!session || session.status !== "aktif") return NextResponse.json({ error: "Sesi sudah dinilai atau tidak valid." }, { status: 409 });

  let correct = 0;
  const answers = body.answers ?? {};
  for (const question of questions) if (answers[String(question.id)] === question.jawaban_benar) correct++;
  const percentage = Math.round(correct / questions.length * 100);
  const passed = percentage >= TRAINING_PASS_PERCENTAGE;
  let message = "Ulangi tingkat yang sama pada sesi berikutnya.";

  await transaction(async (connection) => {
    for (const question of questions) {
      const picked = answers[String(question.id)];
      if (!["a", "b", "c", "d", "e"].includes(picked)) continue;
      const right = picked === question.jawaban_benar;
      await connection.execute("UPDATE sesi_latihan_soal SET jawaban_dipilih=?,benar=? WHERE sesi_id=? AND soal_id=?", [picked, right ? 1 : 0, session.id, question.id]);
      await connection.execute("INSERT INTO jawaban_siswa(user_id,soal_id,jawaban_dipilih,benar) VALUES(?,?,?,?)", [user.id, question.id, picked, right ? 1 : 0]);
    }

    let status = "ulang";
    if (passed) {
      const index = LEVELS.indexOf(session.tingkat);
      await connection.execute("UPDATE progres_latihan_tingkat SET status='lulus',jumlah_sesi=?,selesai_pada=CURRENT_TIMESTAMP WHERE user_id=? AND tingkat=?", [session.nomor_sesi, user.id, session.tingkat]);
      if (index === LEVELS.length - 1) {
        status = "selesai_latihan";
        message = "Semua tingkat telah lulus. Post-test tersedia.";
        await connection.execute("UPDATE progres_latihan SET tingkat_saat_ini=NULL,selesai_latihan=1,posttest_diizinkan=1,alasan_selesai='lulus_tingkat_tinggi',selesai_pada=CURRENT_TIMESTAMP WHERE user_id=?", [user.id]);
      } else {
        const next = LEVELS[index + 1];
        status = "naik_tingkat";
        message = `Lulus! Anda naik ke tingkat ${next}.`;
        await connection.execute("UPDATE progres_latihan SET tingkat_saat_ini=? WHERE user_id=?", [next, user.id]);
        await connection.execute("UPDATE progres_latihan_tingkat SET status='berjalan',mulai_pada=COALESCE(mulai_pada,CURRENT_TIMESTAMP) WHERE user_id=? AND tingkat=?", [user.id, next]);
      }
    } else if (session.nomor_sesi >= TRAINING_MAX_SESSIONS_PER_LEVEL) {
      status = "batas_sesi_habis";
      message = "Batas sesi tercapai. Post-test kini tersedia.";
      await connection.execute("UPDATE progres_latihan_tingkat SET status='batas_sesi_habis',jumlah_sesi=?,selesai_pada=CURRENT_TIMESTAMP WHERE user_id=? AND tingkat=?", [session.nomor_sesi, user.id, session.tingkat]);
      await connection.execute("UPDATE progres_latihan SET tingkat_saat_ini=NULL,selesai_latihan=1,posttest_diizinkan=1,alasan_selesai='batas_sesi_habis',selesai_pada=CURRENT_TIMESTAMP WHERE user_id=?", [user.id]);
    } else {
      await connection.execute("UPDATE progres_latihan_tingkat SET jumlah_sesi=? WHERE user_id=? AND tingkat=?", [session.nomor_sesi, user.id, session.tingkat]);
    }
    await connection.execute("UPDATE riwayat_sesi_latihan SET jumlah_benar=?,persentase=?,status=?,dikumpulkan_pada=CURRENT_TIMESTAMP WHERE id=?", [correct, percentage, status, session.id]);
  });

  return NextResponse.json({ ok: true, correct, total: questions.length, percentage, message });
}
