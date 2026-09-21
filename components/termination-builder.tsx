"use client";

import { useMemo, useState } from "react";
import { Clipboard, Download, Info } from "lucide-react";
import { buildGenericTerminationLetter } from "@/lib/checklist";
import { SourcesPanel } from "@/components/sources-panel";
import { getSources } from "@/lib/official-sources";

export function TerminationBuilder() {
  const [form, setForm] = useState({ fullName: "", address: "", provider: "", contractReference: "", movingDate: "", newAddress: "" });
  const [copied, setCopied] = useState(false);
  const letter = useMemo(() => buildGenericTerminationLetter(form), [form]);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const copy = async () => { await navigator.clipboard.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 1800); };
  const download = () => { const url = URL.createObjectURL(new Blob([letter], { type: "text/plain;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "demande-resiliation-demenagement.txt"; anchor.click(); URL.revokeObjectURL(url); };
  return <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
    <div className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-7"><h2 className="text-2xl font-black text-ink">Informations utiles</h2><div className="mt-6 grid gap-4">{[
      ["fullName", "Nom et prénom", "Ex. Camille Martin"], ["address", "Adresse actuelle", "12 rue des Lilas, 59000 Lille"], ["provider", "Fournisseur", "Nom de l’opérateur ou du service"], ["contractReference", "Référence du contrat", "Facultatif"], ["movingDate", "Date du déménagement", ""], ["newAddress", "Nouvelle adresse", "Facultatif"],
    ].map(([key, label, placeholder]) => <label key={key}><span className="form-label">{label}</span><input className="form-input" type={key === "movingDate" ? "date" : "text"} value={form[key as keyof typeof form]} placeholder={placeholder} onChange={(event) => update(key as keyof typeof form, event.target.value)} /></label>)}</div></div>
    <div><div className="rounded-[1.5rem] border border-border bg-white p-5 sm:p-7"><div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><Info className="mt-0.5 h-5 w-5 shrink-0" /><p>Modèle générique, pas un avis juridique personnalisé. Les conditions peuvent dépendre du contrat, de la durée d’engagement et du fournisseur. Vérifiez avant envoi.</p></div><h2 className="mt-6 text-2xl font-black text-ink">Aperçu du courrier</h2><pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#f7faf8] p-5 font-sans text-sm leading-7 text-ink">{letter}</pre><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button className="button-primary" onClick={copy}><Clipboard className="h-4 w-4" />{copied ? "Copié" : "Copier"}</button><button className="button-secondary" onClick={download}><Download className="h-4 w-4" />Télécharger</button></div></div><div className="mt-5"><SourcesPanel sources={getSources(["sp-telecom-cancel"])} /></div></div>
  </div>;
}
