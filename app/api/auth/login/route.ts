import { z } from "zod";
import { createSession, getDatabase, sessionCookie, verifyPassword } from "@/lib/auth";
import { clientIdentifier, rateLimit, safeLog, verifyMutationOrigin } from "@/lib/security";

const schema = z.object({ email: z.string().email().transform((value) => value.toLowerCase()), password: z.string().min(1).max(128) });
export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  if (!rateLimit(`login:${clientIdentifier(request)}`, 8, 15 * 60_000).allowed) return Response.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "Identifiants invalides." }, { status: 400 });
  try {
    const user = await getDatabase().prepare("SELECT id, password_hash AS passwordHash, password_salt AS passwordSalt, email_verified_at AS emailVerifiedAt FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1").bind(parsed.data.email).first<{ id: string; passwordHash: string; passwordSalt: string; emailVerifiedAt: string | null }>();
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordSalt, user.passwordHash))) { safeLog("login_failed"); return Response.json({ error: "Adresse ou mot de passe incorrect." }, { status: 401 }); }
    if (!user.emailVerifiedAt) return Response.json({ error: "Vérifiez d’abord votre adresse email." }, { status: 403 });
    const session = await createSession(user.id); const headers = new Headers({ "Content-Type": "application/json" }); headers.append("Set-Cookie", sessionCookie(session.raw, session.expires, request.url));
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch { return Response.json({ error: "Connexion indisponible." }, { status: 503 }); }
}
