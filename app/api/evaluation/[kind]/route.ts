import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rows, transaction } from "@/lib/db";
import { evaluationQuestions } from "@/lib/evaluation";
import { PRETEST_HIGH_BOUNDARY, PRETEST_LOW_BOUNDARY } from "@/lib/constants";
import type { UserRow } from "@/lib/types";

function validKind(value:string):value is "pretest"|"posttest"{return value==="pretest"||value==="posttest"}

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
  const questions=await evaluationQuestions(user.id,kind);
  if(questions.length<25)return NextResponse.json({error:`Bank ${kind} belum memiliki 25 soal aktif dengan komposisi yang diperlukan.`},{status:503});
  return NextResponse.json({completed:false,questions:questions.map(({jawaban_benar,pembahasan,_option_order,...q})=>({
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
  const payload=await request.json().catch(()=>null) as {answers?:Record<string,string>}|null; const answers=payload?.answers??{};
  const questions=await evaluationQuestions(user.id,kind); if(questions.length<25)return NextResponse.json({error:"Paket soal tidak lengkap."},{status:503});
  let correct=0;
  await transaction(async connection=>{
    await connection.execute("DELETE FROM jawaban_siswa js USING soal s WHERE s.id=js.soal_id AND js.user_id=? AND s.jenis=?",[user.id,kind]);
    for(const q of questions){const picked=answers[String(q.id)];const valid=["a","b","c","d","e"].includes(picked);const isCorrect=valid&&picked===q.jawaban_benar;if(isCorrect)correct++;if(valid)await connection.execute("INSERT INTO jawaban_siswa(user_id,soal_id,jawaban_dipilih,benar) VALUES(?,?,?,?)",[user.id,q.id,picked,isCorrect?1:0]);}
    const score=Math.round(correct/questions.length*100);
    if(kind==="pretest"){const group=score<PRETEST_LOW_BOUNDARY?"rendah":score<=PRETEST_HIGH_BOUNDARY?"sedang":"tinggi";await connection.execute("UPDATE users SET kelompok=?,pretest_selesai=1 WHERE id=?",[group,user.id]);}
    else await connection.execute("UPDATE users SET posttest_selesai=1 WHERE id=?",[user.id]);
  });
  return NextResponse.json({ok:true,correct,total:questions.length,score:Math.round(correct/questions.length*100)});
}
