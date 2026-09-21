import { getDatabase, requireAdmin } from "@/lib/auth";
import { officialSources } from "@/lib/official-sources";
import { configuredPrices } from "@/lib/paypal";

export async function GET(request: Request) {
  try {
    await requireAdmin(request); const db = getDatabase();
    const [users, payments, feedback, errors, overrides] = await Promise.all([
      db.prepare("SELECT id, email, role, email_verified_at AS emailVerifiedAt, created_at AS createdAt FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100").all(),
      db.prepare("SELECT id, kind, status, amount_cents AS amountCents, currency, provider_capture_id AS captureId, created_at AS createdAt FROM payments ORDER BY created_at DESC LIMIT 100").all(),
      db.prepare("SELECT id, response_id AS responseId, reason, status, created_at AS createdAt FROM feedback ORDER BY created_at DESC LIMIT 100").all(),
      db.prepare("SELECT id, code, route, message, created_at AS createdAt, resolved_at AS resolvedAt FROM system_errors ORDER BY created_at DESC LIMIT 100").all(),
      db.prepare("SELECT id, enabled, last_verified_at AS lastVerifiedAt FROM source_registry").all(),
    ]);
    const map = new Map(overrides.results.map((row) => [row.id, row]));
    return Response.json({ users: users.results, payments: payments.results, feedback: feedback.results, errors: errors.results, prices: await configuredPrices(), sources: officialSources.map((source) => ({ ...source, ...(map.get(source.id) || {}) })) });
  } catch { return Response.json({ error: "Accès administrateur requis." }, { status: 403 }); }
}
