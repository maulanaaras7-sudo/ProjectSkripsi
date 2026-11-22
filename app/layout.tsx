import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Fungsiverse", template: "%s — Fungsiverse" },
  description: "Media pembelajaran interaktif fungsi komposisi dan invers",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <Header />
        <div className="page-shell"><main className="site-main">{children}</main></div>
        <Footer />
      </body>
    </html>
  );
}
