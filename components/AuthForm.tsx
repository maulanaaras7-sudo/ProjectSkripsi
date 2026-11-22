"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode:"login"|"register" }) {
  const router=useRouter(); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false); const [registered,setRegistered]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setMessage("");const response=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))});const data=await response.json();setLoading(false);if(!response.ok){setMessage(data.error??"Permintaan gagal.");return;}if(mode==="register"){setRegistered(true);return;}router.push(data.redirect??"/");router.refresh();}
  if(registered)return <div className="alert alert-success">Akun berhasil dibuat. <Link href="/login">Masuk sekarang</Link>.</div>;
  return <form className="stack" onSubmit={submit}>{message&&<div className="alert alert-danger" role="alert">{message}</div>}{mode==="register"&&<div className="field"><label htmlFor="nama">Nama lengkap</label><input id="nama" name="nama" minLength={2} maxLength={100} required/></div>}<div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" maxLength={100} required/></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={6} required/>{mode==="register"&&<small className="field-help">Password minimal 6 karakter.</small>}</div><button className="btn-primary" disabled={loading} type="submit">{loading?"Memproses…":mode==="login"?"Masuk":"Daftar"}</button></form>;
}
