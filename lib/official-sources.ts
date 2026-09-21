export type OfficialSource = {
  id: string;
  organization: string;
  title: string;
  url: string;
  consultedAt: string;
  enabled: boolean;
  topics: string[];
};

export const OFFICIAL_SOURCE_DOMAINS = [
  "service-public.gouv.fr",
  "legifrance.gouv.fr",
  "economie.gouv.fr",
  "impots.gouv.fr",
  "urssaf.fr",
  "caf.fr",
  "ameli.fr",
  "francetravail.fr",
  "ants.gouv.fr",
] as const;

export const officialSources: OfficialSource[] = [
  {
    id: "sp-moving",
    organization: "Service Public",
    title: "Je déménage en France",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14128",
    consultedAt: "2026-09-21",
    enabled: true,
    topics: ["demenagement", "adresse", "organismes"],
  },
  {
    id: "sp-change-address",
    organization: "Service Public",
    title: "Déclaration de changement d’adresse",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R11193",
    consultedAt: "2026-09-21",
    enabled: true,
    topics: ["adresse", "organismes"],
  },
  {
    id: "sp-health-address",
    organization: "Service Public",
    title: "Sécurité sociale : changement de situation personnelle",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F737",
    consultedAt: "2026-09-21",
    enabled: true,
    topics: ["adresse", "sante"],
  },
  {
    id: "sp-vehicle-address",
    organization: "Service Public",
    title: "Changement d’adresse sur le certificat d’immatriculation",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12118",
    consultedAt: "2026-09-21",
    enabled: true,
    topics: ["adresse", "vehicule"],
  },
  {
    id: "tax-address",
    organization: "Direction générale des Finances publiques",
    title: "Signaler un changement d’adresse aux impôts",
    url: "https://www.impots.gouv.fr/particulier/questions/comment-signaler-mon-changement-dadresse",
    consultedAt: "2026-09-21",
    enabled: true,
    topics: ["adresse", "impots"],
  },
  {
    id: "sp-telecom-cancel",
    organization: "Service Public",
    title: "Téléphone, internet ou télévision : résiliation du contrat",
    url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F22486",
    consultedAt: "2026-09-21",
    enabled: true,
    topics: ["resiliation", "internet", "telephone"],
  },
];

export function getSources(ids: string[]) {
  return officialSources.filter((source) => source.enabled && ids.includes(source.id));
}

export function isAllowedOfficialUrl(rawUrl: string) {
  try {
    const hostname = new URL(rawUrl).hostname.toLowerCase();
    return OFFICIAL_SOURCE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)) || hostname.endsWith(".gouv.fr");
  } catch {
    return false;
  }
}
