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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="wrap">
          <Header />
          <main className="site-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
