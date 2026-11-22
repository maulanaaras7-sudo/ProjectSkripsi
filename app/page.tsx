import { getSession } from "@/lib/auth";
import { LegacyHome } from "@/components/LegacyHome";

export default async function HomePage() {
  const user = await getSession();
  const dashboard = user?.role === "guru" ? "/dashboard/guru" : "/dashboard/siswa";
  const primaryHref = user ? dashboard : "/register";
  const primaryLabel = user?.role === "guru" ? "Buka dashboard guru" : user ? "Lanjutkan belajar" : "Mulai belajar";
  return <LegacyHome primaryHref={primaryHref} primaryLabel={primaryLabel} userRole={user?.role} />;
}
