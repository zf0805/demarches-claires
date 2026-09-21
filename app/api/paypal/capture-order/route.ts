import { z } from "zod";
import { getDatabase, requireUser } from "@/lib/auth";
import { configuredPrices, paypalRequest } from "@/lib/paypal";
import { validateCapture } from "@/lib/payment-validation";
import { verifyMutationOrigin } from "@/lib/security";
export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 }); const parsed = z.object({ orderId: z.string().min(5).max(80) }).safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "Paiement invalide." }, { status: 400 });
  try {
    const user = await requireUser(request); const db = getDatabase(); const payment = await db.prepare("SELECT id, amount_cents AS amountCents, currency FROM payments WHERE provider_order_id = ? AND user_id = ? LIMIT 1").bind(parsed.data.orderId, user.id).first<{ id: string; amountCents: number; currency: string }>(); if (!payment) return Response.json({ error: "Paiement inconnu." }, { status: 404 });
    const order = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(parsed.data.orderId)}/capture`, { method: "POST", body: "{}" }) as { status: string; purchase_units?: Array<{ payments?: { captures?: Array<{ id: string; status: string; amount: { value: string; currency_code: string } }> } }> }; const capture = order.purchase_units?.[0]?.payments?.captures?.[0]; const currentPrices = await configuredPrices(); const valid = validateCapture({ orderStatus: order.status, captureStatus: capture?.status, capturedValue: capture?.amount.value, capturedCurrency: capture?.amount.currency_code, expectedCents: currentPrices.dossier, recordedCents: payment.amountCents, recordedCurrency: payment.currency });
    if (!capture || !valid) { await db.prepare("UPDATE payments SET status = 'VERIFICATION_FAILED', updated_at = ? WHERE id = ?").bind(new Date().toISOString(), payment.id).run(); return Response.json({ error: "Le paiement n’a pas pu être confirmé côté serveur." }, { status: 409 }); }
    await db.prepare("UPDATE payments SET status = 'COMPLETED', provider_capture_id = ?, updated_at = ? WHERE id = ?").bind(capture.id, new Date().toISOString(), payment.id).run(); return Response.json({ ok: true, status: "COMPLETED" });
  } catch { return Response.json({ error: "Confirmation du paiement indisponible." }, { status: 503 }); }
}
