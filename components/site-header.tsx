"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  { href: "/demarches/demenagement", label: "Parcours" },
  { href: "/assistant", label: "Assistant" },
  { href: "/tarifs", label: "Tarifs" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`premium-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="premium-nav-inner">
        <Link className="premium-logo" href="/" prefetch={false} aria-label="Démarches Claires — accueil">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>Démarches Claires</span>
        </Link>
        <nav className="premium-nav-links" aria-label="Navigation principale">
          {links.map((link) => <Link href={link.href} prefetch={false} key={link.href}>{link.label}</Link>)}
        </nav>
        <div className="premium-nav-actions">
          <Link className="premium-login" href="/connexion" prefetch={false}>Connexion</Link>
          <Link className="premium-button nav-cta" href="/demarches/demenagement" prefetch={false}>Commencer <ArrowRight aria-hidden="true" /></Link>
        </div>
        <button className="premium-menu" type="button" aria-expanded={open} aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="premium-mobile-nav" aria-label="Navigation mobile">
          <div>
            {links.map((link) => <Link href={link.href} prefetch={false} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
            <Link href="/changement-adresse" prefetch={false} onClick={() => setOpen(false)}>Changement d’adresse</Link>
            <div className="premium-mobile-actions">
              <Link className="button-secondary justify-center" href="/connexion" prefetch={false}>Connexion</Link>
              <Link className="premium-button justify-center" href="/demarches/demenagement" prefetch={false}>Commencer</Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
