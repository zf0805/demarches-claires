"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";

type Prices = { dossier: number; premium: number; currency: string };

export function Pricing() {
  const router = useRouter();
  const [prices, setPrices] = useState<Prices>({ dossier: 990, premium: 490, currency: "EUR" });
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/prices").then(async (response) => await response.json() as Prices).then(setPrices).catch(() => undefined);
  }, []);

  async function checkout(type: "order" | "subscription") {
    setLoading(type); setError("");
    try {
      const response = await fetch(type === "order" ? "/api/paypal/create-order" : "/api/paypal/create-subscription", { method: "POST" });
      const data = await response.json() as { approvalUrl?: string; error?: string };
      if (!response.ok) {
        if (response.status === 401) { router.push("/connexion"); return; }
        throw new Error(data.error ?? "Paiement indisponible.");
      }
      if (!data.approvalUrl) throw new Error("Lien de paiement indisponible.");
      window.location.assign(data.approvalUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Paiement indisponible."); setLoading(null);
    }
  }

  const euro = (cents: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: prices.currency }).format(cents / 100);
  const plans = [
    { id: "free", name: "Essentiel", price: "Gratuit", description: "Pour commencer sans compte", features: ["Checklist personnalisée", "Liens officiels", "Modèle de courrier", "Assistant limité"] },
    { id: "order", name: "Dossier complet", price: euro(prices.dossier), description: "Paiement unique", features: ["Tout l’accès essentiel", "Export du dossier complet", "Calendrier de rappels", "Historique du paiement"] },
    { id: "subscription", name: "Premium", price: `${euro(prices.premium)} / mois`, description: "Abonnement facultatif", features: ["Dossiers complets", "Démarches sauvegardées", "Assistant étendu", "Annulation depuis votre espace"] },
  ];

  return <>
    <div className="grid gap-5 lg:grid-cols-3">
      {plans.map((plan) => <article className={`flex min-h-[430px] flex-col rounded-[1.5rem] border bg-white p-6 ${plan.id === "order" ? "border-primary ring-4 ring-primary/10" : "border-border"}`} key={plan.id}>
        {plan.id === "order" && <span className="mb-4 w-fit rounded-full bg-mint px-3 py-1 text-xs font-black uppercase tracking-wide text-ink">Le plus simple</span>}
        <h2 className="text-2xl font-black text-ink">{plan.name}</h2><p className="mt-2 text-3xl font-black text-primary">{plan.price}</p><p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        <ul className="my-7 grid gap-3">{plan.features.map((feature) => <li className="flex items-center gap-2 text-sm font-semibold text-ink" key={feature}><Check className="h-4 w-4 text-primary" />{feature}</li>)}</ul>
        {plan.id === "free" ? <Link className="button-secondary mt-auto justify-center" href="/demarches/demenagement" prefetch={false}>Commencer</Link> : <button className="button-primary mt-auto justify-center" onClick={() => checkout(plan.id as "order" | "subscription")}>{loading === plan.id ? <LoaderCircle className="h-5 w-5 animate-spin" /> : plan.id === "order" ? "Acheter le dossier" : "S’abonner"}</button>}
      </article>)}
    </div>
    {error && <p className="mt-5 rounded-xl border border-destructive/20 bg-red-50 p-4 font-semibold text-destructive" role="alert">{error}</p>}
    <p className="mt-6 text-center text-sm leading-6 text-muted-foreground">Les prix sont configurables côté serveur. Le déblocage intervient uniquement après confirmation du paiement par notre serveur et, selon le cas, par notification sécurisée du prestataire de paiement.</p>
  </>;
}
