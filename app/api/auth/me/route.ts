import { getCurrentUser } from "@/lib/auth";
export async function GET(request: Request) { try { const user = await getCurrentUser(request); return Response.json({ user }); } catch { return Response.json({ user: null }); } }
