import type { ReactNode } from "react";
import { IndependentNotice } from "@/components/independent-notice";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function AuthPageShell({ children }: { children: ReactNode }) { return <div className="min-h-screen"><SiteHeader /><main className="hero-grid"><div className="mx-auto grid min-h-[70vh] max-w-5xl gap-8 px-5 py-12 md:grid-cols-[.75fr_1.25fr] md:items-start md:px-8 md:py-20"><div><p className="eyebrow">Espace personnel</p><h2 className="mt-5 text-3xl font-black tracking-tight text-ink">Gardez vos démarches sous la main, pas vos données sensibles.</h2><p className="mt-4 leading-7 text-muted-foreground">Votre espace sert à suivre des tâches et paiements. Ne transmettez ni pièce d’identité, ni identifiant administratif, ni document fiscal, bancaire ou médical.</p><div className="mt-6"><IndependentNotice compact /></div></div>{children}</div></main><SiteFooter /></div>; }
