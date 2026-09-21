import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://demarches-claires.example"),
  title: {
    default: "Démarches Claires — préparez vos démarches de déménagement",
    template: "%s — Démarches Claires",
  },
  description: "Checklist personnalisée, changements d’adresse, courriers et sources officielles pour préparer votre déménagement en France.",
  keywords: ["démarches déménagement", "changement adresse", "organismes prévenir déménagement", "checklist déménagement"],
  openGraph: { type: "website", locale: "fr_FR", title: "Démarches Claires", description: "Préparez vos démarches de déménagement avec une checklist claire et des sources officielles." },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
