import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TerminationBuilder } from "@/components/termination-builder";
import { IndependentNotice } from "@/components/independent-notice";

export const metadata: Metadata = { title: "Lettre de résiliation pour déménagement", description: "Préparez une demande générique de résiliation liée à un déménagement et vérifiez les conditions de votre contrat." };
export default function TerminationPage() { return <div className="min-h-screen"><SiteHeader /><main className="hero-grid"><div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16"><p className="eyebrow">Assistant de courrier</p><h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-.04em] text-ink md:text-5xl">Préparez une demande de résiliation liée à votre déménagement.</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">Complétez un modèle neutre à adapter. Il ne préjuge ni de vos droits, ni des frais, ni de la date effective.</p><div className="my-7 max-w-4xl"><IndependentNotice compact /></div><TerminationBuilder /></div></main><SiteFooter /></div>; }
