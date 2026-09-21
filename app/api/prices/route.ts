import { configuredPrices } from "@/lib/paypal";
export async function GET() { return Response.json(await configuredPrices(), { headers: { "Cache-Control": "public, max-age=300" } }); }
