"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "siswa" | "guru" | null;
const studentLinks = [["/dashboard/siswa", "Ringkasan"], ["/materi", "Materi"], ["/visualisasi", "Simulasi"], ["/latihan", "Latihan"], ["/hasil", "Hasil belajar"], ["/panduan", "Bantuan"]] as const;
const teacherLinks = [["/dashboard/guru", "Dashboard"], ["/guru/materi", "Materi"], ["/guru/soal", "Bank soal"], ["/guru/hasil", "Hasil siswa"], ["/guru/pengaturan", "Pengaturan"], ["/panduan", "Bantuan"]] as const;
const visitorLinks = [["/", "Beranda"], ["/panduan", "Panduan"], ["/materi", "Materi"], ["/visualisasi", "Simulasi"]] as const;

export function PrimaryNavigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = role === "siswa" ? studentLinks : role === "guru" ? teacherLinks : visitorLinks;
  return <nav className="site-nav" aria-label="Navigasi utama">{links.map(([href, label]) => <Link className={pathname === href || (href === "/hasil" && pathname.startsWith("/hasil")) ? "active" : ""} href={href} key={href}>{label}</Link>)}</nav>;
}
