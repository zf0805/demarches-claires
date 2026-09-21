import { env } from "cloudflare:workers";
import { getDatabase, requireUser } from "@/lib/auth";
import { configuredPrices, paypalRequest } from "@/lib/paypal";
import { verifyMutationOrigin } from "@/lib/security";
export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const user = await requireUser(request); const currentPrices = await configuredPrices(); if (!env.PAYPAL_PREMIUM_PLAN_ID) return Response.json({ error: "L’abonnement n’est pas encore configuré." }, { status: 503 }); const origin = env.APP_URL || new URL(request.url).origin;
    const payload = { plan_id: env.PAYPAL_PREMIUM_PLAN_ID, custom_id: user.id, application_context: { brand_name: "Démarches Claires", locale: "fr-FR", user_action: "SUBSCRIBE_NOW", return_url: `${origin}/paiement/retour?type=subscription`, cancel_url: `${origin}/tarifs?paiement=annule` } };
    const subscription = await paypalRequest("/v1/billing/subscriptions", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(payload) }) as { id: string; status: string; links?: Array<{ rel: string; href: string }> };
    const now = new Date().toISOString(); await getDatabase().prepare("INSERT INTO payments (id, user_id, provider_subscription_id, kind, status, amount_cents, currency, created_at, updated_at) VALUES (?, ?, ?, 'subscription', ?, ?, 'EUR', ?, ?)").bind(crypto.randomUUID(), user.id, subscription.id, subscription.status, currentPrices.premium, now, now).run(); return Response.json({ subscriptionId: subscription.id, approvalUrl: subscription.links?.find((link) => link.rel === "approve")?.href });
  } catch (error) { return Response.json({ error: error instanceof Error && error.message === "UNAUTHENTICATED" ? "Connectez-vous avant de vous abonner." : "Création de l’abonnement indisponible." }, { status: 503 }); }
}
