"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, ExternalLink, Flag, LoaderCircle, Send, ShieldAlert, Trash2, UserRound } from "lucide-react";
import { SourcesPanel } from "@/components/sources-panel";
import type { OfficialSource } from "@/lib/official-sources";

type Message = { id: string; role: "user" | "assistant"; text: string; sources?: OfficialSource[]; verifiedAt?: string; limited?: boolean };
const initial: Message[] = [{ id: "welcome", role: "assistant", text: "Bonjour. Je peux vous aider à comprendre une démarche de déménagement ou de changement d’adresse. Décrivez votre situation sans communiquer de numéro administratif, de document d’identité, de donnée bancaire ou médicale." }];

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reported, setReported] = useState<string[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  async function submit(event: FormEvent) {
    event.preventDefault(); if (loading || input.trim().length < 3) return;
    const question = input.trim(); setInput(""); setError(""); setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: question }]); setLoading(true);
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: question, context: "Déménagement et changement d’adresse en France" }) });
      const data = await response.json() as { answer?: string; error?: string; sources?: OfficialSource[]; verifiedAt?: string; limited?: boolean };
      if (!response.ok || !data.answer) throw new Error(data.error || "Réponse indisponible.");
      const id = crypto.randomUUID(); setMessages((current) => [...current, { id, role: "assistant", text: "", sources: data.sources, verifiedAt: data.verifiedAt, limited: data.limited }]);
      const chunks = data.answer.match(/.{1,28}(?:\s|$)/g) || [data.answer];
      for (const chunk of chunks) { await new Promise((resolve) => setTimeout(resolve, 18)); setMessages((current) => current.map((item) => item.id === id ? { ...item, text: item.text + chunk } : item)); }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Réponse indisponible."); }
    finally { setLoading(false); }
  }

  async function report(message: Message) {
    if (reported.includes(message.id)) return;
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ responseId: message.id, reason: "Réponse signalée par l’utilisateur depuis l’assistant." }) });
      if (!response.ok) throw new Error();
      setReported((current) => [...current, message.id]);
    } catch { setError("Le signalement n’a pas pu être enregistré."); }
  }

  return <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_24px_70px_rgba(10,35,46,.08)]">
    <div className="flex flex-col gap-3 border-b border-border bg-[#fbfdfc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 font-black text-ink"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"><Bot className="h-5 w-5" /></span>Assistant démarches</h2><p className="mt-1 text-xs text-muted-foreground">Les réponses peuvent être générées automatiquement et doivent être vérifiées.</p></div><button className="inline-flex items-center gap-2 text-sm font-bold text-destructive" onClick={() => { setMessages(initial); setError(""); }}><Trash2 className="h-4 w-4" />Supprimer la conversation</button></div>
    <div className="h-[min(58vh,620px)] overflow-y-auto p-4 sm:p-6" aria-live="polite">
      <div className="mx-auto max-w-3xl space-y-5">{messages.map((message) => <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`} key={message.id}>
        {message.role === "assistant" && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Bot className="h-5 w-5" /></span>}
        <div className={`max-w-[88%] ${message.role === "user" ? "rounded-2xl rounded-tr-sm bg-primary p-4 text-white" : "min-w-0 rounded-2xl rounded-tl-sm border border-border bg-white p-4 text-ink"}`}>
          <div className="whitespace-pre-wrap text-sm leading-7">{message.text}</div>
          {message.limited && <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950"><ShieldAlert className="h-4 w-4 shrink-0" />Sujet sensible : cette réponse reste générale et mérite une vérification humaine.</div>}
          {message.sources && message.sources.length > 0 && <div className="mt-4"><SourcesPanel sources={message.sources} verifiedAt={message.verifiedAt} /></div>}
          {message.role === "assistant" && message.id !== "welcome" && <button className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-destructive" disabled={reported.includes(message.id)} onClick={() => report(message)}><Flag className="h-3.5 w-3.5" />{reported.includes(message.id) ? "Réponse signalée" : "Signaler cette réponse"}</button>}
        </div>
        {message.role === "user" && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-white"><UserRound className="h-5 w-5" /></span>}
      </div>)}
      {loading && <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin text-primary" />Recherche et vérification des sources officielles…</div>}
      {error && <div className="rounded-xl border border-destructive/20 bg-red-50 p-4 text-sm font-semibold text-destructive" role="alert">{error}</div>}
      <div ref={bottom} /></div>
    </div>
    <form className="border-t border-border bg-[#fbfdfc] p-4 sm:p-5" onSubmit={submit}><div className="mx-auto max-w-3xl"><div className="flex items-end gap-2"><label className="sr-only" htmlFor="assistant-input">Votre question</label><textarea id="assistant-input" className="form-input min-h-14 resize-none" maxLength={1800} rows={2} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ex. Quels organismes prévenir après mon déménagement ?" /><button className="button-primary h-14 min-h-14 px-4" disabled={loading || input.trim().length < 3} aria-label="Envoyer"><Send className="h-5 w-5" /></button></div><p className="mt-2 text-xs text-muted-foreground">N’indiquez aucune donnée sensible. Pour finaliser une démarche, utilisez toujours le site officiel concerné. <a className="font-bold underline" href="https://www.service-public.gouv.fr" target="_blank" rel="noreferrer">Service Public <ExternalLink className="inline h-3 w-3" /></a></p></div></form>
  </div>;
}
