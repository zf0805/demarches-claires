"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(localStorage.getItem("dc-cookie-choice") === null), 0);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  const choose = (value: "necessary" | "all") => {
    localStorage.setItem("dc-cookie-choice", value);
    setVisible(false);
  };
  return (
    <aside className="premium-consent" aria-label="Préférences de cookies">
      <div>
        <p>Nous utilisons uniquement les cookies nécessaires. La mesure d’audience reste désactivée sans accord. <Link href="/confidentialite" prefetch={false}>Confidentialité</Link></p>
        <div>
          <button className="premium-button" onClick={() => choose("all")}>Accepter</button>
          <button className="consent-ghost" onClick={() => choose("necessary")}>Refuser</button>
        </div>
      </div>
    </aside>
  );
}
