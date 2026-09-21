import { env } from "cloudflare:workers";

export function paypalBase() { return env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"; }
export async function paypalAccessToken() {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) throw new Error("PAYPAL_NOT_CONFIGURED");
  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${paypalBase()}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  if (!response.ok) throw new Error("PAYPAL_AUTH_FAILED"); const data = await response.json() as { access_token: string }; return data.access_token;
}
export async function paypalRequest(path: string, init: RequestInit = {}) { const token = await paypalAccessToken(); const response = await fetch(`${paypalBase()}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "PayPal-Request-Id": crypto.randomUUID(), ...(init.headers || {}) } }); const data = response.status === 204 ? null : await response.json().catch(() => null); if (!response.ok) throw new Error(`PAYPAL_${response.status}`); return data; }
export function prices() { return { dossier: Number(env.PRICE_DOSSIER_CENTS || 990), premium: Number(env.PRICE_PREMIUM_CENTS || 490), currency: "EUR" as const }; }
export async function configuredPrices() {
  const fallback = prices();
  if (!env.DB) return fallback;
  try {
    const result = await env.DB.prepare("SELECT id, amount_cents AS amountCents FROM prices WHERE active = 1 AND id IN ('dossier', 'premium')").all<{ id: "dossier" | "premium"; amountCents: number }>();
    for (const row of result.results) fallback[row.id] = Number(row.amountCents);
  } catch { /* migrations may not be applied in a new environment */ }
  return fallback;
}
export function centsToAmount(value: number) { return (value / 100).toFixed(2); }
