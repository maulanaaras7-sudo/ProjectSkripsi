"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Question={id:number;pertanyaan:string;pilihan_a:string;pilihan_b:string;pilihan_c:string;pilihan_d:string;pilihan_e:string|null};
type Session={id:number;tingkat:string;nomor_sesi:number;questions:Question[]};

export function Training(){const router=useRouter();const [session,setSession]=useState<Session|null>(null);const [answers,setAnswers]=useState<Record<number,string>>({});const [message,setMessage]=useState("Menyiapkan sesi latihan…");const [busy,setBusy]=useState(false);
  useEffect(()=>{fetch("/api/training").then(async r=>({ok:r.ok,data:await r.json()})).then(({ok,data})=>{if(!ok)throw new Error(data.error);if(data.completed){setMessage("Latihan telah selesai. Post-test sekarang tersedia.");return;}setSession(data.session);setMessage("");}).catch(e=>setMessage(e.message));},[]);
  async function submit(e:FormEvent){e.preventDefault();if(!session||busy)return;setBusy(true);const response=await fetch("/api/training",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sessionId:session.id,answers})});const data=await response.json();if(!response.ok){setMessage(data.error);setBusy(false);return;}alert(`Sesi selesai: ${data.correct}/${data.total} benar (${data.percentage}%). ${data.message}`);router.push("/dashboard/siswa");router.refresh();}
  if(!session)return <div className="panel"><p>{message}</p>{message.includes("Post-test")&&<a className="btn-primary" href="/posttest">Mulai post-test</a>}</div>;
  return <form onSubmit={submit}><div className="panel"><span className={`badge level-${session.tingkat}`}>Tingkat {session.tingkat}</span><h2>Sesi {session.nomor_sesi}</h2><p>Nilai minimal kelulusan sesi adalah 80%.</p></div>{session.questions.map((q,i)=><article className="question-card" key={q.id}><strong>Soal {i+1}</strong><p>{q.pertanyaan}</p><div className="question-options">{(["a","b","c","d","e"] as const).map(k=>q[`pilihan_${k}`]?<label className="question-option" key={k}><input type="radio" name={`q-${q.id}`} value={k} checked={answers[q.id]===k} onChange={()=>setAnswers(a=>({...a,[q.id]:k}))}/><span><strong>{k.toUpperCase()}.</strong> {q[`pilihan_${k}`]}</span></label>:null)}</div></article>)}<div className="sticky-submit"><span>{Object.keys(answers).length}/{session.questions.length} dijawab</span><button className="btn-primary" disabled={busy} type="submit">{busy?"Menilai…":"Selesaikan sesi"}</button></div></form>}
