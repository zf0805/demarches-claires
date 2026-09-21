import { env } from "cloudflare:workers";
import { z } from "zod";
import { getDatabase, hashPassword, hashToken, randomToken, sendAccountEmail } from "@/lib/auth";
import { clientIdentifier, rateLimit, safeLog, verifyMutationOrigin } from "@/lib/security";

const schema = z.object({ email: z.string().email().max(254).transform((value) => value.toLowerCase()), password: z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/), consent: z.literal(true) });

export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  if (!rateLimit(`register:${clientIdentifier(request)}`, 5, 15 * 60_000).allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Utilisez une adresse valide et un mot de passe d’au moins 12 caractères avec majuscule, minuscule et chiffre." }, { status: 400 });
  try {
    const db = getDatabase(); const now = new Date(); const userId = crypto.randomUUID(); const { hash, salt } = await hashPassword(parsed.data.password); const token = randomToken(); const tokenId = await hashToken(token); const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const existing = await db.prepare("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1").bind(parsed.data.email).first();
    if (existing) return Response.json({ error: "Un compte existe déjà avec cette adresse." }, { status: 409 });
    await db.batch([
      db.prepare("INSERT INTO users (id, email, password_hash, password_salt, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'user', ?, ?)").bind(userId, parsed.data.email, hash, salt, now.toISOString(), now.toISOString()),
      db.prepare("INSERT INTO auth_tokens (id, user_id, kind, expires_at, created_at) VALUES (?, ?, 'verify_email', ?, ?)").bind(tokenId, userId, expiresAt, now.toISOString()),
    ]);
    const origin = env.APP_URL || new URL(request.url).origin; const verificationUrl = `${origin}/verification?token=${encodeURIComponent(token)}`;
    const sent = await sendAccountEmail(parsed.data.email, "Vérifiez votre adresse — Démarches Claires", `<p>Confirmez votre adresse pour activer votre compte :</p><p><a href="${verificationUrl}">Vérifier mon adresse</a></p><p>Ce lien expire dans 24 heures.</p>`);
    safeLog("account_registered", { emailSent: sent });
    return Response.json({ ok: true, emailSent: sent, ...(origin.includes("localhost") ? { verificationUrl } : {}) }, { status: 201 });
  } catch (error) { safeLog("register_error", { code: error instanceof Error ? error.message : "unknown" }); return Response.json({ error: "Inscription indisponible pour le moment." }, { status: 503 }); }
}
