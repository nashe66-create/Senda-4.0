import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Senda 4.0",
  description:
    "Purpose-settlement network — Connect, Biller, pilot walkthrough, and test loop (first wedge: UK→ZW school fees)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexMono.variable} antialiased`}>
        <div
          style={{
            ["--font-sans" as string]: "var(--font-plex-sans), sans-serif",
            ["--font-mono" as string]: "var(--font-plex-mono), monospace",
            fontFamily: "var(--font-plex-sans), sans-serif",
            minHeight: "100vh",
          }}
        >
          <header
            style={{
              borderBottom: "1px solid var(--border)",
              padding: "0.85rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                color: "var(--text)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                textDecoration: "none",
                fontSize: "1.1rem",
              }}
            >
              Senda <span style={{ color: "var(--accent)" }}>4.0</span>
            </Link>
            <nav
              style={{
                display: "flex",
                gap: "1.25rem",
                fontSize: "0.9rem",
              }}
            >
              <Link href="/pilot">Pilot</Link>
              <Link href="/dogfood">Test loop</Link>
              <Link href="/biller">Biller</Link>
              <Link href="/login">Biller login</Link>
            </nav>
          </header>
          <main style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
