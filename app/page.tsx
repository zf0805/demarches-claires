import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PremiumHome } from "@/components/premium-home";

export default function Home() {
  const jsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: "Démarches Claires", description: "Service privé et indépendant d’aide à la préparation des démarches administratives françaises.", inLanguage: "fr-FR" };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }} />
      <SiteHeader />
      <PremiumHome />
      <SiteFooter />
    </div>
  );
}
