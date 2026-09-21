import { env } from "cloudflare:workers";
import { getDatabase } from "@/lib/auth";

export async function POST(request: Request) {
  if (!env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) return Response.json({ error: "Non autorisé." }, { status: 401 });
  try { const now = new Date().toISOString(); const db = getDatabase(); await db.batch([db.prepare("DELETE FROM conversations WHERE expires_at < ?").bind(now), db.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now), db.prepare("DELETE FROM auth_tokens WHERE expires_at < ? OR used_at IS NOT NULL").bind(now)]); return Response.json({ ok: true, purgedAt: now }); } catch { return Response.json({ error: "Purge indisponible." }, { status: 503 }); }
}
