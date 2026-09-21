export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "Démarches Claires",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "À compléter avant mise en production",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "bonjour@demarches-claires.fr",
  colors: {
    primary: "#0b5563",
    accent: "#c5f4d7",
    warning: "#ffd66b",
  },
} as const;

export const independentNotice =
  "Démarches Claires est un service privé et indépendant. Il aide à comprendre et préparer les démarches administratives, mais ne remplace pas une administration, un avocat ou un professionnel qualifié.";
