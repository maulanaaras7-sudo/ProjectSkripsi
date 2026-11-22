import { requireUser } from "@/lib/auth";
import { Training } from "@/components/Training";

export default async function TrainingPage(){await requireUser("siswa");return <><span className="eyebrow">Latihan adaptif</span><h1>Latihan sesuai kemampuanmu</h1><p className="lede">Lulus dengan nilai minimal 80% untuk naik ke tingkat berikutnya.</p><Training/></>}
