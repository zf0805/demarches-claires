import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="premium-footer">
      <div className="footer-emboss" aria-hidden="true">CLAIR.</div>
      <div className="premium-footer-grid">
        <div>
          <Link className="premium-logo" href="/" prefetch={false}>
            <span className="brand-mark" aria-hidden="true"><span /></span>
            Démarches Claires
          </Link>
          <p>Comprendre. Préparer. Avancer.</p>
        </div>
        <nav aria-label="Pied de page"><Link href="/demarches/demenagement" prefetch={false}>Déménagement</Link><Link href="/changement-adresse" prefetch={false}>Changement d’adresse</Link><Link href="/resiliation-demenagement" prefetch={false}>Résiliation</Link><Link href="/assistant" prefetch={false}>Assistant</Link><Link href="/tarifs" prefetch={false}>Tarifs</Link></nav>
        <nav aria-label="Informations légales"><Link href="/a-propos" prefetch={false}>À propos</Link><Link href="/contact" prefetch={false}>Contact</Link><Link href="/confidentialite" prefetch={false}>Confidentialité</Link><Link href="/conditions" prefetch={false}>Conditions</Link><Link href="/mentions-legales" prefetch={false}>Mentions légales</Link></nav>
      </div>
      <div className="premium-footer-bottom"><span>© {new Date().getFullYear()} Démarches Claires</span><span>Service privé et indépendant · Non affilié à une administration</span></div>
    </footer>
  );
}
