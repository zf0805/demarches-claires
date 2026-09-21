import { getDatabase, hashToken } from "@/lib/auth";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token"); if (!token || token.length > 200) return Response.json({ error: "Lien invalide." }, { status: 400 });
  try {
    const db = getDatabase(); const id = await hashToken(token); const now = new Date().toISOString(); const row = await db.prepare("SELECT user_id AS userId, expires_at AS expiresAt, used_at AS usedAt FROM auth_tokens WHERE id = ? AND kind = 'verify_email' LIMIT 1").bind(id).first<{ userId: string; expiresAt: string; usedAt: string | null }>();
    if (!row || row.usedAt || row.expiresAt <= now) return Response.json({ error: "Ce lien est invalide ou expiré." }, { status: 400 });
    await db.batch([db.prepare("UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?").bind(now, now, row.userId), db.prepare("UPDATE auth_tokens SET used_at = ? WHERE id = ?").bind(now, id)]);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Vérification indisponible." }, { status: 503 }); }
}
