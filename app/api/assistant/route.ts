import { env } from "cloudflare:workers";
import { z } from "zod";
import { abusePattern, clientIdentifier, highRiskPattern, rateLimit, safeLog, verifyMutationOrigin } from "@/lib/security";
import { isAllowedOfficialUrl, OFFICIAL_SOURCE_DOMAINS } from "@/lib/official-sources";
import { getDatabase } from "@/lib/auth";
import { assistantInstructions, unreliableAnswer } from "@/lib/assistant-policy";

type RuntimeEnv = Cloudflare.Env & { OPENAI_API_KEY?: string; OPENAI_MODEL?: string };
const bodySchema = z.object({ message: z.string().trim().min(3).max(1800), context: z.string().trim().max(500).optional() });

type ApiOutput = { type?: string; text?: string; content?: Array<{ type?: string; text?: string; annotations?: Array<{ type?: string; url?: string; title?: string }> }>; action?: { sources?: Array<{ type?: string; url?: string; title?: string }> } };

export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const limit = rateLimit(`assistant:${clientIdentifier(request)}`, 10, 60_000);
  if (!limit.allowed) return Response.json({ error: "Trop de demandes. Réessayez dans une minute." }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Question invalide ou trop longue." }, { status: 400 });
  const { message, context } = parsed.data;
  if (abusePattern.test(message)) {
    return Response.json({ answer: "Je ne peux pas aider à frauder, falsifier un document ou contourner la loi. Je peux toutefois expliquer une procédure légale ou vous orienter vers l’administration compétente.", sources: [], verifiedAt: new Date().toISOString().slice(0, 10), limited: true });
  }

  const runtime = env as RuntimeEnv;
  if (!runtime.OPENAI_API_KEY) return Response.json({ error: "L’assistant n’est pas configuré sur cet environnement. Les parcours guidés restent disponibles." }, { status: 503 });
  const highRisk = highRiskPattern.test(message);
  const today = new Date().toISOString().slice(0, 10);
  const instructions = assistantInstructions(today, highRisk);

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${runtime.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: runtime.OPENAI_MODEL || "gpt-5.5",
        instructions,
        input: `${context ? `Contexte du parcours : ${context}\n` : ""}Question : ${message}`,
        tools: [{ type: "web_search", filters: { allowed_domains: [...OFFICIAL_SOURCE_DOMAINS, "gouv.fr"] }, search_context_size: "high" }],
        tool_choice: "required",
        include: ["web_search_call.action.sources"],
        max_output_tokens: 1600,
        store: false,
        safety_identifier: clientIdentifier(request),
      }),
    });
    if (!upstream.ok) { safeLog("assistant_upstream_error", { status: upstream.status }); return Response.json({ error: "La vérification des sources est momentanément indisponible." }, { status: 502 }); }
    const data = await upstream.json() as { output_text?: string; output?: ApiOutput[] };
    const output = data.output || [];
    const answer = data.output_text || output.flatMap((item) => item.content || []).filter((item) => item.type === "output_text").map((item) => item.text).join("\n");
    const rawSources = [
      ...output.flatMap((item) => item.action?.sources || []),
      ...output.flatMap((item) => item.content || []).flatMap((item) => item.annotations || []).filter((item) => item.type === "url_citation"),
    ];
    const disabledRows = await getDatabase().prepare("SELECT url FROM source_registry WHERE enabled = 0").all<{ url: string }>().catch(() => ({ results: [] as { url: string }[] }));
    const disabledUrls = new Set(disabledRows.results.map((row) => row.url));
    const seen = new Set<string>();
    const sources = rawSources.filter((source) => source.url && isAllowedOfficialUrl(source.url) && !disabledUrls.has(source.url) && !seen.has(source.url) && seen.add(source.url)).slice(0, 8).map((source) => ({
      id: source.url!, organization: organizationFromUrl(source.url!), title: source.title || "Page officielle consultée", url: source.url!, consultedAt: today, enabled: true, topics: ["assistant"],
    }));
    if (!answer || sources.length === 0) return Response.json({ answer: unreliableAnswer, sources: [], verifiedAt: today, limited: true });
    safeLog("assistant_answered", { sourceCount: sources.length, highRisk });
    return Response.json({ answer, sources, verifiedAt: today, limited: highRisk });
  } catch {
    safeLog("assistant_exception");
    return Response.json({ error: "Impossible de vérifier la réponse pour le moment. Réessayez plus tard." }, { status: 502 });
  }
}

function organizationFromUrl(raw: string) {
  const host = new URL(raw).hostname.replace(/^www\./, "");
  if (host.includes("service-public")) return "Service Public";
  if (host.includes("legifrance")) return "Légifrance";
  if (host.includes("impots")) return "Finances publiques";
  if (host.includes("ameli")) return "Assurance Maladie";
  if (host.includes("caf")) return "Caf";
  if (host.includes("francetravail")) return "France Travail";
  return host;
}
