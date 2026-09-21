import { createHash } from "node:crypto";

const windows = new Map<string, { count: number; resetAt: number }>();

export function clientIdentifier(request: Request) {
  const value = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

export function rateLimit(key: string, limit = 12, windowMs = 60_000) {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  current.count += 1;
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count) };
}

export function verifyMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  if (!host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export function safeLog(event: string, metadata: Record<string, string | number | boolean | undefined> = {}) {
  const clean = Object.fromEntries(Object.entries(metadata).filter(([, value]) => typeof value !== "string" || value.length < 120));
  console.info(JSON.stringify({ event, ...clean, at: new Date().toISOString() }));
}

export const highRiskPattern = /\b(immigration|visa|titre de séjour|expulsion|divorce|garde d'enfant|violence|pénal|plainte|licenciement|harcèlement|litige|fiscalité complexe|redressement|santé|médical|données sensibles)\b/i;
export const abusePattern = /\b(falsifier|faux document|frauder|fraude|contourner la loi|pirater|usurper|cacher aux impôts|échapper au contrôle)\b/i;
