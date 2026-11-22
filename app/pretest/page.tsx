import { requireUser } from "@/lib/auth";
import { Evaluation } from "@/components/Evaluation";

export default async function PretestPage(){await requireUser("siswa");return <><span className="eyebrow">Evaluasi awal</span><h1>Pre-test</h1><p className="lede">Kerjakan 25 soal dalam 60 menit. Jawaban kosong dihitung salah.</p><Evaluation kind="pretest"/></>}
