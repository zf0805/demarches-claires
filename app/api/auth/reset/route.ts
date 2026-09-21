import { z } from "zod";
import { getDatabase, hashPassword, hashToken } from "@/lib/auth";
import { verifyMutationOrigin } from "@/lib/security";

const schema = z.object({ token: z.string().min(20).max(200), password: z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/) });
export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "Lien ou mot de passe invalide." }, { status: 400 });
  try { const db = getDatabase(); const id = await hashToken(parsed.data.token); const now = new Date().toISOString(); const row = await db.prepare("SELECT user_id AS userId, expires_at AS expiresAt, used_at AS usedAt FROM auth_tokens WHERE id = ? AND kind = 'reset_password' LIMIT 1").bind(id).first<{ userId: string; expiresAt: string; usedAt: string | null }>(); if (!row || row.usedAt || row.expiresAt <= now) return Response.json({ error: "Lien invalide ou expiré." }, { status: 400 }); const password = await hashPassword(parsed.data.password); await db.batch([db.prepare("UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?").bind(password.hash, password.salt, now, row.userId), db.prepare("UPDATE auth_tokens SET used_at = ? WHERE id = ?").bind(now, id), db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.userId)]); return Response.json({ ok: true }); } catch { return Response.json({ error: "Réinitialisation indisponible." }, { status: 503 }); }
}
