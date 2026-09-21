"use client";

import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SourcesPanel } from "@/components/sources-panel";
import { getSources } from "@/lib/official-sources";

const organizations = [
  { id: "impots", label: "Impôts", detail: "Mettre à jour l’adresse dans l’espace particulier ou par le canal officiel indiqué.", url: "https://www.impots.gouv.fr/particulier/questions/comment-signaler-mon-changement-dadresse", source: "tax-address" },
  { id: "sante", label: "Assurance maladie", detail: "Vérifier les modalités selon votre régime de rattachement.", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F737", source: "sp-health-address" },
  { id: "caf", label: "Caf ou MSA", detail: "Déclarer le changement si vous percevez des prestations concernées.", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R11193", source: "sp-change-address" },
  { id: "emploi", label: "France Travail ou employeur", detail: "Actualiser votre adresse auprès de l’interlocuteur qui vous concerne.", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14128", source: "sp-moving" },
  { id: "vehicule", label: "Certificat d’immatriculation", detail: "Suivre la procédure officielle ; un véhicule en leasing peut relever d’une démarche différente.", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12118", source: "sp-vehicle-address" },
  { id: "banque", label: "Banque et assurances", detail: "Prévenir chaque organisme et vérifier les effets sur les contrats.", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14128", source: "sp-moving" },
];

export function AddressJourney() {
  const [selected, setSelected] = useState(["impots", "sante", "caf", "banque"]);
  const [generated, setGenerated] = useState(false);
  const chosen = organizations.filter((item) => selected.includes(item.id));
  const sources = getSources([...new Set(chosen.map((item) => item.source))]);
  return <div className="rounded-[1.75rem] border border-border bg-white p-5 shadow-[0_24px_70px_rgba(10,35,46,.08)] sm:p-8">
    {!generated ? <>
      <h2 className="text-2xl font-black text-ink">Quels organismes vous concernent ?</h2><p className="mt-2 text-muted-foreground">Choisissez uniquement ceux qui ont réellement besoin de votre adresse.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">{organizations.map((item) => <label className="checkbox-row" key={item.id}><Checkbox checked={selected.includes(item.id)} onCheckedChange={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} /><span>{item.label}</span></label>)}</div>
      <button className="button-primary mt-6" disabled={selected.length === 0} onClick={() => setGenerated(true)}>Créer ma liste <Check className="h-5 w-5" /></button>
    </> : <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.14em] text-primary">Liste personnalisée</p><h2 className="mt-1 text-2xl font-black text-ink">{chosen.length} organismes à vérifier</h2></div><button className="button-secondary min-h-10 px-4 py-2 text-sm" onClick={() => setGenerated(false)}>Modifier</button></div>
      <div className="mt-6 grid gap-4">{chosen.map((item) => <article className="rounded-2xl border border-border p-5" key={item.id}><h3 className="text-lg font-black text-ink">{item.label}</h3><p className="mt-2 leading-6 text-muted-foreground">{item.detail}</p><a className="mt-3 inline-flex items-center gap-1 font-bold text-primary underline" href={item.url} target="_blank" rel="noreferrer">Démarche officielle <ExternalLink className="h-4 w-4" /></a></article>)}</div>
      <div className="mt-6"><SourcesPanel sources={sources} /></div>
    </>}
  </div>;
}
