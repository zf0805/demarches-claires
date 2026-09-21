"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";

export function VerifyEmail() {
  const [state, setState] = useState("Vérification en cours…"); const [ok, setOk] = useState(false);
  useEffect(() => {
    async function verify() {
      await Promise.resolve(); const token = new URLSearchParams(location.search).get("token");
      if (!token) { setState("Lien de vérification manquant."); return; }
      try { const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "Lien invalide."); setOk(true); setState("Votre adresse est vérifiée. Vous pouvez vous connecter."); }
      catch (error) { setState(error instanceof Error ? error.message : "Lien invalide."); }
    }
    void verify();
  }, []);
  return <StatusCard ok={ok} text={state} />;
}

export function ResetPassword() {
  const [password, setPassword] = useState(""); const [state, setState] = useState(""); const [ok, setOk] = useState(false); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); const token = new URLSearchParams(location.search).get("token") || ""; try { const response = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error ?? "Réinitialisation impossible."); setOk(true); setState("Mot de passe modifié. Toutes les anciennes sessions ont été fermées."); } catch (error) { setState(error instanceof Error ? error.message : "Réinitialisation impossible."); } finally { setLoading(false); } }
  if (ok) return <StatusCard ok text={state} />;
  return <div className="rounded-[1.5rem] border border-border bg-white p-7"><h1 className="text-3xl font-black text-ink">Nouveau mot de passe</h1><form className="mt-6 grid gap-4" onSubmit={submit}><label><span className="form-label">Mot de passe</span><input className="form-input" type="password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{state && <p className="text-sm font-semibold text-destructive" role="alert">{state}</p>}<button className="button-primary justify-center" disabled={loading}>{loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "Enregistrer"}</button></form></div>;
}

function StatusCard({ ok, text }: { ok: boolean; text: string }) { return <div className="rounded-[1.5rem] border border-border bg-white p-7 text-center">{ok ? <CheckCircle2 className="mx-auto h-12 w-12 text-primary" /> : <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary" />}<p className="mt-4 text-lg font-bold text-ink">{text}</p>{ok && <Link className="button-primary mt-5" href="/connexion" prefetch={false}>Se connecter</Link>}</div>; }
