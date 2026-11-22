import { requireUser } from "@/lib/auth";
import { Evaluation } from "@/components/Evaluation";

export default async function PosttestPage(){await requireUser("siswa");return <><span className="eyebrow">Evaluasi akhir</span><h1>Post-test</h1><p className="lede">Ukur perkembangan pemahamanmu setelah menyelesaikan latihan.</p><Evaluation kind="posttest"/></>}
