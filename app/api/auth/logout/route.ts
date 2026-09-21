import { clearSessionCookie, getDatabase, hashToken, SESSION_COOKIE } from "@/lib/auth";
import { verifyMutationOrigin } from "@/lib/security";

export async function POST(request: Request) {
  if (!verifyMutationOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const raw = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (raw) { try { await getDatabase().prepare("DELETE FROM sessions WHERE id = ?").bind(await hashToken(raw)).run(); } catch { /* cookie is cleared regardless */ } }
  const headers = new Headers({ "Content-Type": "application/json" }); headers.append("Set-Cookie", clearSessionCookie(request.url));
  return new Response(JSON.stringify({ ok: true }), { headers });
}
