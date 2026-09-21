import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const base = process.env.NEXT_PUBLIC_SITE_URL || "https://demarches-claires.example"; return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/tableau-de-bord", "/paiement/"] }], sitemap: `${base}/sitemap.xml` }; }
