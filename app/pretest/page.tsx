import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Evaluation } from "@/components/Evaluation";

export default async function PretestPage(){await requireUser("siswa");return <><h1 className="section-title">Pre-test Penempatan</h1><p className="lede">Jawab seluruh 25 soal yang dipilih secara acak dan setara. Hasil ini menentukan tingkat awal latihan Anda.</p><p className="pretest-guide-link"><Link href="/panduan#siswa">Lihat panduan siswa</Link> sebelum mengerjakan jika Anda baru pertama kali menggunakan Fungsiverse.</p><Evaluation kind="pretest"/></>}
