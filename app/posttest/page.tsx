import { requireUser } from "@/lib/auth";
import { Evaluation } from "@/components/Evaluation";

export default async function PosttestPage(){await requireUser("siswa");return <><h1 className="section-title">Posttest</h1><p className="lede">Kerjakan 25 soal yang dipilih secara acak dengan bobot yang sama seperti pre-test untuk melihat perkembangan belajar Anda.</p><Evaluation kind="posttest"/></>}
