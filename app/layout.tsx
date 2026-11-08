import "./globals.css";
import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Rivalry – Challenge friends to the same level",
  description: "Create an Obstacle Rush challenge, send the link, and race your friends on the identical seeded course. Every run is replayed on the server; stakes and payouts settle on Solana devnet.",
  openGraph: { title: "Rivalry", description: "Same level. Same rules. Verified results.", type: "website" },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#111111", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..600&family=Martian+Mono:wght@400..500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-bg">
        <a href="#main" className="skip btn-primary">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
