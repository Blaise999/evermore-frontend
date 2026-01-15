// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evermore Hospitals",
  description: "Care, compassion, and modern patient experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-slate-900 antialiased">
        <main id="main-container" className="min-h-[60vh]">
          {children}
        </main>
      </body>
    </html>
  );
}
