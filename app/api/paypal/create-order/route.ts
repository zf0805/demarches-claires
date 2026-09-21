import { env } from "cloudflare:workers";
import { getDatabase, requireUser } from "@/lib/auth";
import { centsToAmount, configuredPrices, paypalRequest } from "@/lib/paypal";
import { verifyMutationOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const user = await requireUser(request); const amount = (await configuredPrices()).dossier; const origin = env.APP_URL || new URL(request.url).origin;
    const payload = { intent: "CAPTURE", purchase_units: [{ reference_id: "dossier-complet", custom_id: user.id, description: "Dossier complet Démarches Claires", amount: { currency_code: "EUR", value: centsToAmount(amount) } }], payment_source: { paypal: { experience_context: { brand_name: "Démarches Claires", locale: "fr-FR", user_action: "PAY_NOW", return_url: `${origin}/paiement/retour?type=order`, cancel_url: `${origin}/tarifs?paiement=annule` } } } };
    const order = await paypalRequest("/v2/checkout/orders", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }) as { id: string; status: string; links?: Array<{ rel: string; href: string }> };
    const now = new Date().toISOString(); await getDatabase().prepare("INSERT INTO payments (id, user_id, provider_order_id, kind, status, amount_cents, currency, created_at, updated_at) VALUES (?, ?, ?, 'one_time', ?, ?, 'EUR', ?, ?)").bind(crypto.randomUUID(), user.id, order.id, order.status, amount, now, now).run();
    return Response.json({ orderId: order.id, approvalUrl: order.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href });
  } catch (error) { const code = error instanceof Error ? error.message : "unknown"; return Response.json({ error: code === "UNAUTHENTICATED" ? "Connectez-vous avant le paiement." : "Création du paiement indisponible." }, { status: code === "UNAUTHENTICATED" ? 401 : 503 }); }
}
