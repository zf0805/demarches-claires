"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

type Status = "loading" | "success" | "pending" | "error";

export function PaymentReturn() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Vérification du paiement côté serveur…");

  useEffect(() => {
    async function verify() {
      await Promise.resolve();
      const params = new URLSearchParams(location.search); const type = params.get("type"); const token = params.get("token"); const subscriptionId = params.get("subscription_id");
      if (type === "subscription" && subscriptionId) { setStatus("pending"); setMessage("Votre demande d’abonnement a été reçue. L’accès sera activé après confirmation sécurisée du paiement."); return; }
      if (type !== "order" || !token) { setStatus("error"); setMessage("Informations de paiement manquantes."); return; }
      try { const response = await fetch("/api/paypal/capture-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: token }) }); const data = await response.json() as { ok?: boolean; error?: string }; if (!response.ok || !data.ok) throw new Error(data.error ?? "Paiement non confirmé."); setStatus("success"); setMessage("Le paiement a été confirmé par le serveur. Votre dossier complet est disponible."); }
      catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "Paiement non confirmé."); }
    }
    void verify();
  }, []);

  return <div className="rounded-[1.5rem] border border-border bg-white p-8 text-center shadow-[0_18px_60px_rgba(10,35,46,.08)]">
    {status === "loading" ? <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-primary" /> : status === "error" ? <XCircle className="mx-auto h-12 w-12 text-destructive" /> : <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />}
    <h1 className="mt-5 text-3xl font-black text-ink">{status === "success" ? "Paiement confirmé" : status === "pending" ? "Confirmation en attente" : status === "error" ? "Paiement non confirmé" : "Vérification en cours"}</h1>
    <p className="mx-auto mt-3 max-w-xl leading-7 text-muted-foreground">{message}</p><div className="mt-6 flex flex-wrap justify-center gap-3">{status === "success" && <a className="button-primary" href="/api/dossier/full">Télécharger mon dossier</a>}<Link className="button-secondary" href="/tableau-de-bord" prefetch={false}>Tableau de bord</Link></div>
  </div>;
}
