import type { Metadata } from "next";
import { MovingJourney } from "@/components/moving-journey";
import { IndependentNotice } from "@/components/independent-notice";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Checklist déménagement personnalisée", description: "Préparez les démarches de votre déménagement : organismes à prévenir, priorités, liens officiels et rappels." };

export default function MovingPage() {
  return <div className="min-h-screen"><SiteHeader /><main className="hero-grid"><div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-16"><div className="mb-8 max-w-3xl"><p className="eyebrow">Parcours guidé • environ 3 minutes</p><h1 className="mt-5 text-4xl font-black tracking-[-.04em] text-ink md:text-5xl">Préparez votre déménagement, étape par étape.</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">Obtenez une liste adaptée à votre logement et aux organismes qui vous concernent. Aucun document sensible n’est demandé.</p></div><div className="mb-5"><IndependentNotice compact /></div><MovingJourney /></div></main><SiteFooter /></div>;
}
