import { env } from "cloudflare:workers";
import { getDatabase } from "@/lib/auth";
import { paypalRequest } from "@/lib/paypal";
import { safeLog } from "@/lib/security";

type WebhookEvent = { id: string; event_type: string; resource?: { id?: string; status?: string; billing_agreement_id?: string } };
export async function POST(request: Request) {
  if (!env.PAYPAL_WEBHOOK_ID) return Response.json({ error: "Webhook non configuré." }, { status: 503 });
  const event = await request.json().catch(() => null) as WebhookEvent | null; if (!event?.id || !event.event_type) return Response.json({ error: "Événement invalide." }, { status: 400 });
  try {
    const verification = await paypalRequest("/v1/notifications/verify-webhook-signature", { method: "POST", body: JSON.stringify({ transmission_id: request.headers.get("paypal-transmission-id"), transmission_time: request.headers.get("paypal-transmission-time"), cert_url: request.headers.get("paypal-cert-url"), auth_algo: request.headers.get("paypal-auth-algo"), transmission_sig: request.headers.get("paypal-transmission-sig"), webhook_id: env.PAYPAL_WEBHOOK_ID, webhook_event: event }) }) as { verification_status?: string };
    if (verification.verification_status !== "SUCCESS") return Response.json({ error: "Signature invalide." }, { status: 400 });
    const db = getDatabase(); const existing = await db.prepare("SELECT id FROM webhook_events WHERE id = ?").bind(event.id).first(); if (existing) return Response.json({ ok: true, duplicate: true }); const now = new Date().toISOString(); await db.prepare("INSERT INTO webhook_events (id, event_type, received_at) VALUES (?, ?, ?)").bind(event.id, event.event_type, now).run();
    const subscriptionId = event.resource?.billing_agreement_id || (event.event_type.startsWith("BILLING.SUBSCRIPTION") ? event.resource?.id : undefined);
    const statuses: Record<string, string> = { "BILLING.SUBSCRIPTION.ACTIVATED": "ACTIVE", "BILLING.SUBSCRIPTION.CANCELLED": "CANCELLED", "BILLING.SUBSCRIPTION.SUSPENDED": "SUSPENDED", "BILLING.SUBSCRIPTION.EXPIRED": "EXPIRED", "BILLING.SUBSCRIPTION.PAYMENT.FAILED": "PAYMENT_FAILED", "PAYMENT.SALE.COMPLETED": "ACTIVE", "PAYMENT.SALE.REFUNDED": "REFUNDED", "PAYMENT.CAPTURE.COMPLETED": "COMPLETED", "PAYMENT.CAPTURE.REFUNDED": "REFUNDED", "PAYMENT.CAPTURE.DENIED": "FAILED" };
    if (subscriptionId && statuses[event.event_type]) await db.prepare("UPDATE payments SET status = ?, updated_at = ? WHERE provider_subscription_id = ?").bind(statuses[event.event_type], now, subscriptionId).run();
    if (event.resource?.id && statuses[event.event_type] && event.event_type.startsWith("PAYMENT.CAPTURE")) await db.prepare("UPDATE payments SET status = ?, updated_at = ? WHERE provider_capture_id = ?").bind(statuses[event.event_type], now, event.resource.id).run();
    await db.prepare("UPDATE webhook_events SET processed_at = ? WHERE id = ?").bind(now, event.id).run(); safeLog("paypal_webhook_processed", { type: event.event_type }); return Response.json({ ok: true });
  } catch { return Response.json({ error: "Traitement temporairement indisponible." }, { status: 503 }); }
}
