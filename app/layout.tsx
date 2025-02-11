import type { Metadata } from "next";
import "./globals.css";
import "@xterm/xterm/css/xterm.css";

export const metadata: Metadata = {
  title: "Veil — Research AI Platform",
  description: "Train models and read papers in one flow. Four specialized AI modes, 1000s of workflows, your credentials, your compute.",
  icons: { icon: "/favicon.svg", apple: "/logo-transparent.png" },
  authors: [{ name: "Vibhor Pandey", url: "mailto:vibhorpandey09@gmail.com" }],
  creator: "Vibhor Pandey",
  publisher: "Veil Research",
  metadataBase: new URL("https://veilresearch.com"),
  openGraph: {
    type: "website",
    url: "https://veilresearch.com",
    title: "Veil — Research AI Platform",
    description: "Train models and read papers in one flow. Four specialized AI modes, 1000s of workflows, your credentials, your compute.",
    siteName: "Veil Research",
    images: [{ url: "/logo-transparent.png", width: 512, height: 512, alt: "Veil Research" }],
  },
  twitter: {
    card: "summary",
    title: "Veil — Research AI Platform",
    description: "Train models and read papers in one flow.",
    images: ["/logo-transparent.png"],
  },
  manifest: "/manifest.json",
  other: {
    "copyright": "© 2026 Veil Research. All rights reserved.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="resp-nav" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: "60px",
          background: "rgba(5,5,8,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/logo-transparent.png" alt="Veil" style={{ width: "30px", height: "30px", objectFit: "contain", filter: "invert(1)" }} />
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#ededff", letterSpacing: "-0.5px" }}>Veil</span>
          </a>

          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {[
              { label: "Chat",         href: "/chat" },
              { label: "Modes",        href: "/#modes" },
              { label: "Workflows",    href: "/#workflows" },
              { label: "Pricing",      href: "/pricing" },
              { label: "About",        href: "/about" },
              { label: "Changelog",    href: "/changelog" },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                padding: "6px 14px", borderRadius: "8px", fontSize: "13.5px",
                fontWeight: 500, color: "#7878a8", textDecoration: "none",
              }}>
                {link.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/login" className="nav-links" style={{ padding: "6px 16px", borderRadius: "8px", fontSize: "13.5px", fontWeight: 500, color: "#7878a8", textDecoration: "none" }}>
              Sign in
            </a>
            <a href="/dashboard" style={{
              padding: "7px 20px", borderRadius: "9px", fontSize: "13.5px", fontWeight: 600,
              color: "#fff", textDecoration: "none",
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              boxShadow: "0 0 20px rgba(139,92,246,0.3)",
            }}>
              Dashboard →
            </a>
          </div>
        </nav>

        <main style={{ paddingTop: "60px" }}>
          {children}
        </main>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}` }} />
      </body>
    </html>
  );
}
