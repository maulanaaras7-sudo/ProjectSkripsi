import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rows, transaction } from "@/lib/db";
import { evaluationQuestions } from "@/lib/evaluation";
import { EvaluationBlueprintError } from "@/lib/evaluation-selection";
import { PRETEST_HIGH_BOUNDARY, PRETEST_LOW_BOUNDARY } from "@/lib/constants";
import type { UserRow } from "@/lib/types";

function validKind(value:string):value is "pretest"|"posttest"{return value==="pretest"||value==="posttest"}
function blueprintFailure(error:unknown,kind:"pretest"|"posttest"){
  if(!(error instanceof EvaluationBlueprintError))throw error;
  console.error("assessment-blueprint-shortage",{kind,missingSlots:error.missingSlots});
  return NextResponse.json({error:`Bank ${kind} belum memenuhi kisi-kisi paket 25 soal.`,code:error.code,missingSlots:error.missingSlots},{status:503});
}
async function deadlineFor(userId:number,kind:"pretest"|"posttest") {
  try {
    const [existing]=await rows<Array<Record<string,unknown>&{deadline_pada:string}>>("SELECT deadline_pada FROM evaluation_attempts WHERE user_id=? AND jenis=?",[userId,kind]);
    if(existing)return existing.deadline_pada;
    const [created]=await rows<Array<Record<string,unknown>&{deadline_pada:string}>>("INSERT INTO evaluation_attempts(user_id,jenis,deadline_pada) VALUES(?,?,CURRENT_TIMESTAMP + INTERVAL '60 minutes') ON CONFLICT(user_id,jenis) DO UPDATE SET jenis=EXCLUDED.jenis RETURNING deadline_pada",[userId,kind]);
    return created?.deadline_pada??null;
  }catch{return null;}
}

export async function GET(_:Request,{params}:{params:Promise<{kind:string}>}){
  const user=await getSession(); if(!user||user.role!=="siswa")return NextResponse.json({error:"Silakan masuk sebagai siswa."},{status:401});
  const {kind}=await params; if(!validKind(kind))return NextResponse.json({error:"Jenis evaluasi tidak valid."},{status:404});
  const [fresh]=await rows<UserRow[]>("SELECT * FROM users WHERE id=?",[user.id]);
  if(!fresh)return NextResponse.json({error:"Akun tidak ditemukan."},{status:404});
  if(kind==="pretest"&&fresh.pretest_selesai)return NextResponse.json({error:"Pre-test sudah diselesaikan."},{status:409});
  if(kind==="posttest"){
    const [progress]=await rows<any[]>("SELECT posttest_diizinkan FROM progres_latihan WHERE user_id=? LIMIT 1",[user.id]);
    if(!fresh.pretest_selesai||!progress?.posttest_diizinkan)return NextResponse.json({error:"Selesaikan alur latihan sebelum membuka post-test."},{status:403});
    if(fresh.posttest_selesai)return NextResponse.json({error:"Post-test sudah diselesaikan."},{status:409});
  }
  let questions;
  try{questions=await evaluationQuestions(user.id,kind);}catch(error){return blueprintFailure(error,kind);}
  const deadlineAt=await deadlineFor(user.id,kind);
  return NextResponse.json({completed:false,deadlineAt,questions:questions.map(({jawaban_benar,pembahasan,_option_order,...q})=>({
    ...q,
    options:(_option_order??[]).map((key)=>({value:key,text:q[`pilihan_${key}`]})),
  }))});
}

export async function POST(request:Request,{params}:{params:Promise<{kind:string}>}){
  const user=await getSession(); if(!user||user.role!=="siswa")return NextResponse.json({error:"Sesi tidak valid."},{status:401});
  const {kind}=await params; if(!validKind(kind))return NextResponse.json({error:"Jenis evaluasi tidak valid."},{status:404});
  const [fresh]=await rows<UserRow[]>("SELECT * FROM users WHERE id=?",[user.id]);
  if(!fresh)return NextResponse.json({error:"Akun tidak ditemukan."},{status:404});
  if((kind==="pretest"&&fresh.pretest_selesai)||(kind==="posttest"&&fresh.posttest_selesai))return NextResponse.json({error:"Evaluasi sudah diselesaikan."},{status:409});
  if(kind==="posttest"){
    const [progress]=await rows<any[]>("SELECT posttest_diizinkan FROM progres_latihan WHERE user_id=? LIMIT 1",[user.id]);
    if(!progress?.posttest_diizinkan)return NextResponse.json({error:"Selesaikan alur latihan sebelum membuka post-test."},{status:403});
  }
  let timeExpired=false;
  try {
    const [attempt]=await rows<Array<Record<string,unknown>&{deadline_pada:string}>>("SELECT deadline_pada FROM evaluation_attempts WHERE user_id=? AND jenis=?",[user.id,kind]);
    if(attempt){const deadline=new Date(attempt.deadline_pada).getTime();timeExpired=Date.now()>=deadline;if(Date.now()>deadline+15_000)return NextResponse.json({error:"Waktu evaluasi telah berakhir. Pengiriman melewati toleransi 15 detik tidak dapat dinilai."},{status:409});}
  } catch { /* Deployment lama tanpa tabel attempt tetap dapat menyelesaikan evaluasi. */ }
  const payload=await request.json().catch(()=>null) as {answers?:Record<string,string>}|null; const answers=payload?.answers??{};
  let questions;
  try{questions=await evaluationQuestions(user.id,kind);}catch(error){return blueprintFailure(error,kind);}
  if(!timeExpired&&questions.some(question=>!["a","b","c","d","e"].includes(answers[String(question.id)])))return NextResponse.json({error:`Semua soal wajib dijawab sebelum ${kind === "pretest" ? "pre-test" : "post-test"} dikirim.`},{status:400});
  let correct=0;
  await transaction(async connection=>{
    await connection.execute("DELETE FROM jawaban_siswa js USING soal s WHERE s.id=js.soal_id AND js.user_id=? AND s.jenis=?",[user.id,kind]);
    for(const q of questions){const picked=answers[String(q.id)];const valid=["a","b","c","d","e"].includes(picked);const isCorrect=valid&&picked===q.jawaban_benar;if(isCorrect)correct++;if(valid)await connection.execute("INSERT INTO jawaban_siswa(user_id,soal_id,jawaban_dipilih,benar) VALUES(?,?,?,?)",[user.id,q.id,picked,isCorrect?1:0]);}
    const score=Math.round(correct/questions.length*100);
    if(kind==="pretest"){const group=score<PRETEST_LOW_BOUNDARY?"rendah":score<=PRETEST_HIGH_BOUNDARY?"sedang":"tinggi";await connection.execute("UPDATE users SET kelompok=?,pretest_selesai=1 WHERE id=?",[group,user.id]);}
    else await connection.execute("UPDATE users SET posttest_selesai=1 WHERE id=?",[user.id]);
    await connection.execute("DELETE FROM draft_jawaban_evaluasi WHERE user_id=? AND attempt_key=? AND jenis=?",[user.id,`assessment-v1:${kind}:user:${user.id}`,kind]).catch(() => undefined);
    await connection.execute("DELETE FROM evaluation_attempts WHERE user_id=? AND jenis=?",[user.id,kind]).catch(() => undefined);
  });
  return NextResponse.json({ok:true,correct,total:questions.length,score:Math.round(correct/questions.length*100)});
}
