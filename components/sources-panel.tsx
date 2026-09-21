"use client";

import { ExternalLink } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { OfficialSource } from "@/lib/official-sources";

function displayDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR").format(new Date(`${date}T12:00:00Z`));
}

export function SourcesPanel({ sources, verifiedAt = "2026-09-21" }: { sources: OfficialSource[]; verifiedAt?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white px-5">
      <Accordion type="single" collapsible>
        <AccordionItem value="sources">
          <AccordionTrigger className="text-base font-black text-ink hover:no-underline">
            Sources officielles consultées <span className="ml-auto mr-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-primary">{sources.length}</span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="grid gap-3">
              {sources.map((source) => (
                <li className="rounded-xl bg-muted/70 p-4" key={source.id}>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">{source.organization}</p>
                  <a className="mt-1 inline-flex items-start gap-2 font-bold text-ink underline decoration-primary/30 hover:decoration-primary" href={source.url} target="_blank" rel="noreferrer">
                    {source.title}<ExternalLink aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">Consultée le {displayDate(source.consultedAt)}</p>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <p className="border-t border-border py-3 text-xs font-semibold text-muted-foreground">Vérifié le : {displayDate(verifiedAt)}</p>
    </div>
  );
}
