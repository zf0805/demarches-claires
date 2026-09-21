"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ExternalLink, FileDown, Save, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SourcesPanel } from "@/components/sources-panel";
import { generateMovingChecklist, type ContractKey, type MovingProfile } from "@/lib/checklist";
import { getSources } from "@/lib/official-sources";

const contractChoices: { value: ContractKey; label: string }[] = [
  { value: "energie", label: "Électricité / gaz" },
  { value: "internet", label: "Internet / téléphone" },
  { value: "assurance", label: "Assurances" },
  { value: "vehicule", label: "Véhicule" },
  { value: "caf", label: "Caf / Assurance maladie" },
  { value: "emploi", label: "Employeur / France Travail" },
];

const initialProfile: MovingProfile = {
  oldCity: "",
  newCity: "",
  movingDate: "",
  housingStatus: "locataire",
  householdType: "individuel",
  contracts: ["energie", "internet", "assurance"],
  familySituation: "",
};

declare global {
  interface Document {
    modelContext?: {
      registerTool(tool: { name: string; title?: string; description: string; inputSchema: object; execute(input: unknown): unknown; annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean } }, options?: { signal?: AbortSignal }): void | Promise<void>;
    };
  }
}

export function MovingJourney() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<MovingProfile>(initialProfile);
  const [completed, setCompleted] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const checklist = useMemo(() => generateMovingChecklist(profile), [profile]);
  const sources = useMemo(() => getSources([...new Set(checklist.map((item) => item.sourceId))]), [checklist]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "generate_moving_checklist",
        title: "Créer une checklist de déménagement",
        description: "Renseigne le parcours visible et génère la checklist de déménagement personnalisée.",
        inputSchema: {
          type: "object",
          properties: {
            oldCity: { type: "string" }, newCity: { type: "string" }, movingDate: { type: "string", format: "date" },
            housingStatus: { type: "string", enum: ["locataire", "proprietaire"] }, householdType: { type: "string", enum: ["individuel", "colocation"] },
            contracts: { type: "array", items: { type: "string", enum: contractChoices.map((item) => item.value) } },
          },
          required: ["oldCity", "newCity", "movingDate", "housingStatus", "householdType", "contracts"], additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          const value = input as MovingProfile;
          if (!value.oldCity || !value.newCity || !/^\d{4}-\d{2}-\d{2}$/.test(value.movingDate)) throw new Error("Villes et date valides requises");
          setProfile(value); setStep(3);
          return { itemCount: generateMovingChecklist(value).length, status: "generated" };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch { /* navigateur sans prise en charge complète */ }
    return () => lifecycle.abort();
  }, []);

  function next() {
    if (step === 1 && (!profile.oldCity.trim() || !profile.newCity.trim() || !profile.movingDate)) {
      setError("Renseignez les deux villes et la date prévue pour continuer."); return;
    }
    setError(""); setStep((value) => Math.min(3, value + 1));
  }

  function toggleContract(value: ContractKey) {
    setProfile((current) => ({ ...current, contracts: current.contracts.includes(value) ? current.contracts.filter((item) => item !== value) : [...current.contracts, value] }));
  }

  function toggleCompleted(id: string) {
    setCompleted((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  }

  function downloadCalendar() {
    const events = checklist.map((item, index) => `BEGIN:VEVENT\nUID:${item.id}-${index}@demarches-claires.fr\nDTSTART;VALUE=DATE:${profile.movingDate.replaceAll("-", "")}\nSUMMARY:${item.title}\nDESCRIPTION:${item.description}\nEND:VEVENT`).join("\n");
    const content = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Demarches Claires//FR\n${events}\nEND:VCALENDAR`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "rappels-demenagement.ics"; anchor.click(); URL.revokeObjectURL(url);
  }

  async function saveProcedure() {
    setSaveStatus("saving"); setError("");
    try {
      const response = await fetch("/api/procedures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "demenagement",
          title: `Déménagement ${profile.oldCity} → ${profile.newCity}`,
          data: { profile, checklist, completed },
        }),
      });
      const data = await response.json() as { id?: string; error?: string };
      if (response.status === 401) { router.push("/connexion?retour=/demarches/demenagement"); return; }
      if (!response.ok) throw new Error(data.error ?? "Sauvegarde impossible.");
      setSaveStatus("saved");
    } catch (caught) {
      setSaveStatus("idle"); setError(caught instanceof Error ? caught.message : "Sauvegarde impossible.");
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-border bg-white shadow-[0_24px_70px_rgba(10,35,46,.08)]">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-8">
        <div><p className="text-xs font-black uppercase tracking-[.14em] text-primary">Étape {step} sur 3</p><h2 className="mt-1 text-xl font-black text-ink">{step === 1 ? "Votre déménagement" : step === 2 ? "Votre situation" : "Votre checklist"}</h2></div>
        <div className="flex gap-1.5" aria-hidden="true">{[1, 2, 3].map((item) => <span className={`h-2.5 w-8 rounded-full ${item <= step ? "bg-primary" : "bg-muted"}`} key={item} />)}</div>
      </div>

      {step === 1 && (
        <div className="grid gap-5 p-5 sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label><span className="form-label">Ancienne ville</span><input className="form-input" value={profile.oldCity} onChange={(event) => setProfile({ ...profile, oldCity: event.target.value })} placeholder="Ex. Lille" autoComplete="address-level2" /></label>
            <label><span className="form-label">Nouvelle ville</span><input className="form-input" value={profile.newCity} onChange={(event) => setProfile({ ...profile, newCity: event.target.value })} placeholder="Ex. Nantes" autoComplete="address-level2" /></label>
          </div>
          <label><span className="form-label">Date prévue du déménagement</span><input className="form-input" type="date" value={profile.movingDate} onChange={(event) => setProfile({ ...profile, movingDate: event.target.value })} /></label>
          {error && <p className="rounded-xl border border-destructive/20 bg-red-50 p-3 text-sm font-semibold text-destructive" role="alert">{error}</p>}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-7 p-5 sm:p-8">
          <fieldset><legend className="form-label">Vous êtes</legend><div className="grid grid-cols-2 gap-3">{(["locataire", "proprietaire"] as const).map((value) => <button className={`choice-button ${profile.housingStatus === value ? "active" : ""}`} type="button" onClick={() => setProfile({ ...profile, housingStatus: value })} key={value}>{value === "locataire" ? "Locataire" : "Propriétaire"}</button>)}</div></fieldset>
          <fieldset><legend className="form-label">Votre logement</legend><div className="grid grid-cols-2 gap-3">{(["individuel", "colocation"] as const).map((value) => <button className={`choice-button ${profile.householdType === value ? "active" : ""}`} type="button" onClick={() => setProfile({ ...profile, householdType: value })} key={value}>{value === "individuel" ? "Individuel / famille" : "Colocation"}</button>)}</div></fieldset>
          <fieldset><legend className="form-label">Contrats et organismes concernés</legend><div className="grid gap-3 sm:grid-cols-2">{contractChoices.map((choice) => <label className="checkbox-row" key={choice.value}><Checkbox checked={profile.contracts.includes(choice.value)} onCheckedChange={() => toggleContract(choice.value)} /><span>{choice.label}</span></label>)}</div></fieldset>
          <label><span className="form-label">Situation familiale (facultatif)</span><select className="form-input" value={profile.familySituation} onChange={(event) => setProfile({ ...profile, familySituation: event.target.value })}><option value="">Ne pas préciser</option><option value="seul">Je déménage seul·e</option><option value="couple">En couple</option><option value="famille">Avec enfant(s)</option></select></label>
        </div>
      )}

      {step === 3 && (
        <div className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-secondary p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="flex items-center gap-2 font-black text-ink"><Sparkles className="h-5 w-5 text-primary" /> {checklist.length} actions pour votre déménagement</p><p className="mt-1 text-sm text-muted-foreground">De {profile.oldCity} à {profile.newCity} — repères pratiques, à confirmer selon vos contrats.</p></div>
            <button className="button-secondary min-h-10 px-4 py-2 text-sm" onClick={downloadCalendar}><CalendarDays className="h-4 w-4" /> Calendrier .ics</button>
          </div>
          <div className="grid gap-4">
            {checklist.map((item) => (
              <article className={`checklist-item ${completed.includes(item.id) ? "completed" : ""}`} key={item.id}>
                <button className="mt-1 shrink-0" aria-label={completed.includes(item.id) ? `Marquer ${item.title} comme à faire` : `Marquer ${item.title} comme terminée`} onClick={() => toggleCompleted(item.id)}>
                  <CheckCircle2 className={`h-6 w-6 ${completed.includes(item.id) ? "fill-primary text-primary" : "text-border"}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className={`priority ${item.priority}`}>{item.priority}</span><span className="text-xs font-bold text-muted-foreground">{item.timing}</span></div>
                  <h3 className="mt-2 text-lg font-black text-ink">{item.title}</h3><p className="text-sm font-semibold text-primary">{item.organization}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  <a className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary underline" href={item.officialUrl} target="_blank" rel="noreferrer">Ouvrir la démarche officielle <ExternalLink className="h-3.5 w-3.5" /></a>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2"><button className="button-secondary justify-center" onClick={downloadCalendar}><FileDown className="h-5 w-5" /> Télécharger les rappels</button><button className="button-primary justify-center" disabled={saveStatus !== "idle"} onClick={saveProcedure}><Save className="h-5 w-5" /> {saveStatus === "saving" ? "Sauvegarde…" : saveStatus === "saved" ? "Checklist sauvegardée" : "Sauvegarder dans mon espace"}</button></div>
          {error && <p className="mt-3 rounded-xl border border-destructive/20 bg-red-50 p-3 text-sm font-semibold text-destructive" role="alert">{error}</p>}
          <div className="mt-6"><SourcesPanel sources={sources} /></div>
        </div>
      )}

      {step < 3 && <div className="flex items-center justify-between border-t border-border px-5 py-5 sm:px-8">{step > 1 ? <button className="button-secondary" onClick={() => setStep((value) => value - 1)}><ArrowLeft className="h-5 w-5" /> Retour</button> : <span />}<button className="button-primary" onClick={next}>{step === 2 ? "Créer ma checklist" : "Continuer"}<ArrowRight className="h-5 w-5" /></button></div>}
    </div>
  );
}
