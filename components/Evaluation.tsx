"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Question = { id:number; pertanyaan:string; options:Array<{value:string;text:string}> };

export function Evaluation({ kind }: { kind: "pretest" | "posttest" }) {
  const router = useRouter();
  const [questions,setQuestions]=useState<Question[]>([]);
  const [answers,setAnswers]=useState<Record<number,string>>({});
  const [seconds,setSeconds]=useState(3600);
  const [message,setMessage]=useState("Memuat soal…");
  const [autosave,setAutosave]=useState("Menyiapkan autosave…");
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{ fetch(`/api/evaluation/${kind}`).then(async r=>({ok:r.ok,data:await r.json()})).then(({ok,data})=>{if(!ok) throw new Error(data.error); setQuestions(data.questions); const saved=localStorage.getItem(`fungsiverse-${kind}-draft`); if(saved){try{setAnswers(JSON.parse(saved));setAutosave("Draf jawaban dipulihkan.");}catch{localStorage.removeItem(`fungsiverse-${kind}-draft`);}}else setAutosave("Autosave aktif."); setMessage("");}).catch(e=>setMessage(e.message)); },[kind]);
  useEffect(()=>{if(!questions.length)return;const timer=setTimeout(()=>{localStorage.setItem(`fungsiverse-${kind}-draft`,JSON.stringify(answers));setAutosave(`Tersimpan otomatis ${new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})}.`);},500);return()=>clearTimeout(timer);},[answers,kind,questions.length]);
  useEffect(()=>{ if(!questions.length) return; const timer=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000); return()=>clearInterval(timer); },[questions.length]);
  useEffect(()=>{ if(seconds===0 && questions.length && !submitting) (document.getElementById("evaluation-form") as HTMLFormElement | null)?.requestSubmit(); },[seconds,questions.length,submitting]);

  async function submit(event:FormEvent<HTMLFormElement>){ event.preventDefault(); if(submitting)return; setSubmitting(true); const response=await fetch(`/api/evaluation/${kind}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({answers})}); const data=await response.json(); if(!response.ok){setMessage(data.error??"Gagal menyimpan jawaban.");setSubmitting(false);return;} localStorage.removeItem(`fungsiverse-${kind}-draft`); alert(`${kind==="pretest"?"Pre-test":"Post-test"} selesai. Nilai Anda: ${data.score}`); router.push("/dashboard/siswa"); router.refresh(); }
  const answered=Object.keys(answers).length; const time=`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
  if(!questions.length) return <div className="panel"><p>{message}</p></div>;
  return <form id="evaluation-form" onSubmit={submit}>{message&&<div className="alert">{message}</div>}<div className="sticky-submit"><span><strong>{answered}/{questions.length}</strong> soal dijawab · <span className="timer">{time}</span><small className="autosave-label">{autosave}</small></span><button className="btn-primary" disabled={submitting} type="submit">{submitting?"Menyimpan…":"Kumpulkan jawaban"}</button></div>{questions.map((q,index)=><article className="question-card" key={q.id}><strong>Soal {index+1}</strong><p>{q.pertanyaan}</p><div className="question-options">{q.options.map((option,optionIndex)=><label className="question-option" key={option.value}><input type="radio" name={`q-${q.id}`} value={option.value} checked={answers[q.id]===option.value} onChange={()=>setAnswers(v=>({...v,[q.id]:option.value}))}/><span><strong>{String.fromCharCode(65+optionIndex)}.</strong> {option.text}</span></label>)}</div></article>)}</form>;
}
