import type { Metadata } from "next";
import { AssistantChat } from "@/components/assistant-chat";
import { IndependentNotice } from "@/components/independent-notice";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: "Assistant administratif indépendant", description: "Posez une question en français et consultez les sources officielles utilisées pour préparer la réponse." };
export default function AssistantPage() { return <div className="min-h-screen"><SiteHeader /><main className="hero-grid"><div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14"><div className="mb-6"><p className="eyebrow">Information générale sourcée</p><h1 className="mt-4 text-4xl font-black tracking-[-.04em] text-ink md:text-5xl">Posez votre question, gardez votre jugement.</h1><p className="mt-3 max-w-3xl text-lg leading-8 text-muted-foreground">Les réponses expliquent les sources disponibles. Elles ne constituent ni une décision officielle ni une consultation juridique.</p></div><div className="mb-5"><IndependentNotice compact /></div><AssistantChat /></div></main><SiteFooter /></div>; }
