import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evermore Hospitals",
  description: "World-class healthcare with CareFlex credit. Transparent billing, exceptional patient care across the UK.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..700&family=DM+Serif+Display&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh bg-white text-slate-900 antialiased" style={{ fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}>
        <main id="main-container" className="min-h-[60vh]">
          {children}
        </main>
      </body>
    </html>
  );
}
