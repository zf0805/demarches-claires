import { Info } from "lucide-react";
import { independentNotice } from "@/lib/brand";

export function IndependentNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`rounded-2xl border border-primary/15 bg-secondary text-ink ${compact ? "p-4" : "p-5"}`}>
      <div className="flex gap-3">
        <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className={`${compact ? "text-sm" : "text-sm md:text-base"} leading-6`}>{independentNotice}</p>
      </div>
    </aside>
  );
}
