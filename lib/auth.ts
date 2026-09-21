import { env } from "cloudflare:workers";

const encoder = new TextEncoder();
export const SESSION_COOKIE = "dc_session";

function bytesToBase64Url(bytes: Uint8Array) { let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, ""); }
export function randomToken(size = 32) { return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(size))); }
export async function hashToken(token: string) { const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token)); return bytesToBase64Url(new Uint8Array(digest)); }

export async function hashPassword(password: string, salt = randomToken(16)) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 310_000 }, key, 256);
  return { hash: bytesToBase64Url(new Uint8Array(bits)), salt };
}

export async function verifyPassword(password: string, salt: string, expected: string) { const { hash } = await hashPassword(password, salt); if (hash.length !== expected.length) return false; let difference = 0; for (let i = 0; i < hash.length; i++) difference |= hash.charCodeAt(i) ^ expected.charCodeAt(i); return difference === 0; }
export function getDatabase() { if (!env.DB) throw new Error("DATABASE_UNAVAILABLE"); return env.DB; }

export async function createSession(userId: string) {
  const raw = randomToken(); const id = await hashToken(raw); const now = new Date(); const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  await getDatabase().prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").bind(id, userId, expires.toISOString(), now.toISOString()).run();
  return { raw, expires };
}

export function sessionCookie(raw: string, expires: Date, requestUrl: string) { const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : ""; return `${SESSION_COOKIE}=${raw}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}${secure}`; }
export function clearSessionCookie(requestUrl: string) { return sessionCookie("", new Date(0), requestUrl); }

export async function getCurrentUser(request: Request) {
  const raw = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!raw) return null;
  const id = await hashToken(raw);
  const row = await getDatabase().prepare("SELECT u.id, u.email, u.role, u.email_verified_at AS emailVerifiedAt, s.expires_at AS expiresAt FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND u.deleted_at IS NULL LIMIT 1").bind(id).first<{ id: string; email: string; role: "user" | "admin"; emailVerifiedAt: string | null; expiresAt: string }>();
  if (!row || row.expiresAt <= new Date().toISOString()) return null;
  return row;
}

export async function requireUser(request: Request) { const user = await getCurrentUser(request); if (!user) throw new Error("UNAUTHENTICATED"); return user; }
export async function requireAdmin(request: Request) { const user = await requireUser(request); if (user.role !== "admin") throw new Error("FORBIDDEN"); return user; }

export async function sendAccountEmail(to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return false;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, html }) });
  return response.ok;
}
