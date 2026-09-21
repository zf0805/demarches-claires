import type { Metadata } from "next";
import { AddressJourney } from "@/components/address-journey";
import { IndependentNotice } from "@/components/independent-notice";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Changement d’adresse : organismes à prévenir", description: "Créez votre liste personnalisée des organismes à prévenir lors d’un changement d’adresse en France." };
export default function AddressPage() { return <div className="min-h-screen"><SiteHeader /><main className="hero-grid"><div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16"><p className="eyebrow">Changement d’adresse</p><h1 className="mt-5 text-4xl font-black tracking-[-.04em] text-ink md:text-5xl">Prévenez les bons organismes, sans vous éparpiller.</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">Sélectionnez votre situation puis ouvrez les démarches officielles. Le service public de changement de coordonnées peut regrouper plusieurs déclarations, selon les organismes disponibles.</p><div className="my-7"><IndependentNotice compact /></div><AddressJourney /></div></main><SiteFooter /></div>; }
