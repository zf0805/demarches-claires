import { env } from "cloudflare:workers";
import { z } from "zod";
import { getDatabase, hashToken, randomToken, sendAccountEmail } from "@/lib/auth";
import { clientIdentifier, rateLimit, verifyMutationOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  if (!rateLimit(`reset:${clientIdentifier(request)}`, 4, 30 * 60_000).allowed) return Response.json({ ok: true });
  const parsed = z.object({ email: z.string().email().transform((value) => value.toLowerCase()) }).safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ ok: true });
  try {
    const db = getDatabase(); const user = await db.prepare("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1").bind(parsed.data.email).first<{ id: string }>();
    if (user) { const token = randomToken(); const id = await hashToken(token); const now = new Date(); await db.prepare("INSERT INTO auth_tokens (id, user_id, kind, expires_at, created_at) VALUES (?, ?, 'reset_password', ?, ?)").bind(id, user.id, new Date(now.getTime() + 60 * 60_000).toISOString(), now.toISOString()).run(); const origin = env.APP_URL || new URL(request.url).origin; await sendAccountEmail(parsed.data.email, "Réinitialiser votre mot de passe", `<p><a href="${origin}/reinitialisation?token=${encodeURIComponent(token)}">Choisir un nouveau mot de passe</a></p><p>Ce lien expire dans une heure.</p>`); }
  } catch { /* generic response prevents account enumeration */ }
  return Response.json({ ok: true });
}
