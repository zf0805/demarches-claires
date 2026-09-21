"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CreditCard, Database, LoaderCircle, RefreshCw, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Data = {
  users: Array<Record<string, unknown>>; payments: Array<Record<string, unknown>>; feedback: Array<Record<string, unknown>>; errors: Array<Record<string, unknown>>;
  prices: { dossier: number; premium: number };
  sources: Array<{ id: string; organization: string; title: string; url: string; enabled: boolean | number; consultedAt: string; lastVerifiedAt?: string }>;
};

export function AdminDashboard() {
  const [data, setData] = useState<Data | null>(null); const [error, setError] = useState("");
  const [priceDraft, setPriceDraft] = useState({ dossier: 990, premium: 490 });
  const load = useCallback(async (clearError = true) => {
    if (clearError) setError("");
    try { const response = await fetch("/api/admin/overview"); const value = await response.json() as Data & { error?: string }; if (!response.ok) throw new Error(value.error ?? "Chargement impossible."); setData(value); setPriceDraft(value.prices); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Chargement impossible."); }
  }, []);

  useEffect(() => {
    async function initialLoad() { await Promise.resolve(); await load(false); }
    void initialLoad();
  }, [load]);

  async function toggleSource(id: string, enabled: boolean) { const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "source", id, enabled }) }); if (response.ok) await load(); }
  async function updatePrice(id: "dossier" | "premium") { const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "price", id, amountCents: priceDraft[id] }) }); if (response.ok) await load(); else setError("Le tarif n’a pas pu être enregistré."); }
  if (error) return <div className="rounded-2xl border border-destructive/20 bg-red-50 p-6 text-center text-destructive"><AlertTriangle className="mx-auto h-10 w-10" /><p className="mt-3 font-bold">{error}</p></div>;
  if (!data) return <div className="flex min-h-[50vh] items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>;

  const cards = [{ label: "Utilisateurs", value: data.users.length, icon: Users }, { label: "Paiements", value: data.payments.length, icon: CreditCard }, { label: "Signalements", value: data.feedback.length, icon: AlertTriangle }, { label: "Erreurs", value: data.errors.length, icon: Database }];
  return <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Administration</p><h1 className="mt-4 text-4xl font-black tracking-tight text-ink">Pilotage et vérification</h1></div><button className="button-secondary" onClick={() => load()}><RefreshCw className="h-4 w-4" />Actualiser</button></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <article className="rounded-2xl border border-border bg-white p-5" key={label}><Icon className="h-5 w-5 text-primary" /><p className="mt-5 text-3xl font-black text-ink">{value}</p><p className="text-sm text-muted-foreground">{label}</p></article>)}</div>
    <Tabs className="mt-8" defaultValue="sources"><TabsList className="h-auto flex-wrap"><TabsTrigger value="sources">Sources</TabsTrigger><TabsTrigger value="prices">Tarifs</TabsTrigger><TabsTrigger value="users">Utilisateurs</TabsTrigger><TabsTrigger value="payments">Paiements</TabsTrigger><TabsTrigger value="feedback">Signalements</TabsTrigger><TabsTrigger value="errors">Erreurs</TabsTrigger></TabsList>
      <TabsContent value="sources"><div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted"><tr><th className="p-4">Organisme</th><th className="p-4">Page</th><th className="p-4">Dernière vérification</th><th className="p-4">État</th></tr></thead><tbody>{data.sources.map((source) => <tr className="border-t border-border" key={source.id}><td className="p-4 font-bold">{source.organization}</td><td className="p-4"><a className="underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a></td><td className="p-4">{source.lastVerifiedAt || source.consultedAt}</td><td className="p-4"><button className={`rounded-full px-3 py-1 text-xs font-black ${source.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`} onClick={() => toggleSource(source.id, !source.enabled)}>{source.enabled ? "Active" : "Désactivée"}</button></td></tr>)}</tbody></table></div></TabsContent>
      <TabsContent value="prices"><div className="mt-4 grid gap-4 rounded-2xl border border-border bg-white p-6 sm:grid-cols-2">{(["dossier", "premium"] as const).map((id) => <label key={id}><span className="form-label">{id === "dossier" ? "Dossier complet" : "Premium mensuel"} (centimes)</span><div className="flex gap-2"><input className="form-input" type="number" min={100} max={100000} value={priceDraft[id]} onChange={(event) => setPriceDraft((current) => ({ ...current, [id]: Number(event.target.value) }))} /><button className="button-primary compact" onClick={() => updatePrice(id)} type="button">Enregistrer</button></div></label>)}</div></TabsContent>
      {(["users", "payments", "feedback", "errors"] as const).map((key) => <TabsContent value={key} key={key}><div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white p-4"><pre className="text-xs leading-5 text-ink">{JSON.stringify(data[key], null, 2)}</pre></div></TabsContent>)}
    </Tabs>
  </div>;
}
