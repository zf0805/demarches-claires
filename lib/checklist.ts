import { addDays, format, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export type HousingStatus = "locataire" | "proprietaire";
export type HouseholdType = "individuel" | "colocation";
export type ContractKey = "energie" | "internet" | "assurance" | "vehicule" | "caf" | "emploi";

export type MovingProfile = {
  oldCity: string;
  newCity: string;
  movingDate: string;
  housingStatus: HousingStatus;
  householdType: HouseholdType;
  contracts: ContractKey[];
  familySituation?: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  organization: string;
  description: string;
  timing: string;
  priority: "prioritaire" | "important" | "utile";
  sourceId: string;
  officialUrl: string;
  category: "avant" | "jour-j" | "apres";
};

const sourceUrl = {
  moving: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14128",
  address: "https://www.service-public.gouv.fr/particuliers/vosdroits/R11193",
  vehicle: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12118",
  tax: "https://www.impots.gouv.fr/particulier/questions/comment-signaler-mon-changement-dadresse",
} as const;

function dateLabel(date: Date, fallback: string) {
  return isValid(date) ? format(date, "d MMMM yyyy", { locale: fr }) : fallback;
}

export function generateMovingChecklist(profile: MovingProfile): ChecklistItem[] {
  const parsed = parseISO(profile.movingDate);
  const before = dateLabel(addDays(parsed, -30), "Environ un mois avant");
  const weekBefore = dateLabel(addDays(parsed, -7), "Environ une semaine avant");
  const after = dateLabel(addDays(parsed, 7), "Dans la semaine qui suit");
  const items: ChecklistItem[] = [
    {
      id: "address-grouped",
      title: "Déclarer votre changement de coordonnées",
      organization: "Service Public",
      description: "Le téléservice officiel peut transmettre la nouvelle adresse à plusieurs organismes compatibles. Vérifiez la liste proposée au moment de la démarche.",
      timing: after,
      priority: "prioritaire",
      sourceId: "sp-change-address",
      officialUrl: sourceUrl.address,
      category: "apres",
    },
    {
      id: "taxes",
      title: "Mettre à jour votre adresse fiscale",
      organization: "Finances publiques",
      description: "Signalez la nouvelle adresse depuis votre espace particulier ou par les moyens indiqués par l’administration fiscale.",
      timing: after,
      priority: "important",
      sourceId: "tax-address",
      officialUrl: sourceUrl.tax,
      category: "apres",
    },
    {
      id: "mail",
      title: "Organiser le suivi du courrier",
      organization: "Services postaux",
      description: "Option pratique, non administrative : comparez les offres de réexpédition et informez directement vos correspondants importants.",
      timing: weekBefore,
      priority: "utile",
      sourceId: "sp-moving",
      officialUrl: sourceUrl.moving,
      category: "avant",
    },
  ];

  if (profile.housingStatus === "locataire") {
    items.unshift({
      id: "tenant",
      title: "Préparer le départ du logement",
      organization: "Bailleur ou agence",
      description: "Relisez votre bail, vérifiez les modalités de congé et préparez l’état des lieux. Le délai applicable dépend du logement et de la situation : confirmez-le auprès d’une source officielle ou d’un professionnel.",
      timing: before,
      priority: "prioritaire",
      sourceId: "sp-moving",
      officialUrl: sourceUrl.moving,
      category: "avant",
    });
  } else {
    items.push({
      id: "owner",
      title: "Informer les interlocuteurs liés au bien",
      organization: "Syndic, assurance, collectivités",
      description: "Si le bien est en copropriété, communiquez votre nouvelle adresse au syndic et vérifiez vos contrats d’assurance.",
      timing: before,
      priority: "important",
      sourceId: "sp-moving",
      officialUrl: sourceUrl.moving,
      category: "avant",
    });
  }

  const contractItems: Partial<Record<ContractKey, ChecklistItem>> = {
    energie: {
      id: "energy",
      title: "Organiser les contrats d’énergie",
      organization: "Fournisseurs d’énergie",
      description: "Contactez les fournisseurs pour connaître les relevés, les modalités de clôture et l’ouverture à la nouvelle adresse.",
      timing: weekBefore,
      priority: "prioritaire",
      sourceId: "sp-moving",
      officialUrl: sourceUrl.moving,
      category: "avant",
    },
    internet: {
      id: "internet",
      title: "Vérifier le transfert ou la résiliation internet",
      organization: "Opérateur",
      description: "Demandez l’éligibilité à la nouvelle adresse et consultez les conditions contractuelles avant toute résiliation.",
      timing: before,
      priority: "important",
      sourceId: "sp-telecom-cancel",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F22486",
      category: "avant",
    },
    assurance: {
      id: "insurance",
      title: "Informer vos assureurs",
      organization: "Assureurs",
      description: "Indiquez la date et la nouvelle adresse afin que l’assureur vous précise l’adaptation ou la résiliation possible du contrat.",
      timing: weekBefore,
      priority: "prioritaire",
      sourceId: "sp-moving",
      officialUrl: sourceUrl.moving,
      category: "avant",
    },
    vehicule: {
      id: "vehicle",
      title: "Mettre à jour l’adresse du véhicule",
      organization: "France Titres",
      description: "Utilisez la démarche officielle correspondant à votre certificat d’immatriculation. Les conditions peuvent varier, notamment pour un véhicule en leasing.",
      timing: after,
      priority: "prioritaire",
      sourceId: "sp-vehicle-address",
      officialUrl: sourceUrl.vehicle,
      category: "apres",
    },
    caf: {
      id: "caf",
      title: "Signaler le changement aux organismes sociaux",
      organization: "Caf, CPAM ou organismes concernés",
      description: "Mettez à jour les organismes qui gèrent effectivement vos prestations ou votre couverture.",
      timing: after,
      priority: "important",
      sourceId: "sp-health-address",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F737",
      category: "apres",
    },
    emploi: {
      id: "employment",
      title: "Informer votre employeur ou France Travail",
      organization: "Employeur ou France Travail",
      description: "Mettez à jour votre adresse auprès des interlocuteurs professionnels qui en ont besoin.",
      timing: after,
      priority: "important",
      sourceId: "sp-moving",
      officialUrl: sourceUrl.moving,
      category: "apres",
    },
  };

  for (const contract of profile.contracts) {
    const item = contractItems[contract];
    if (item) items.push(item);
  }

  if (profile.householdType === "colocation") {
    items.push({
      id: "roommates",
      title: "Coordonner les démarches de colocation",
      organization: "Colocataires, bailleur et fournisseurs",
      description: "Identifiez les titulaires de chaque contrat et du bail avant de demander un transfert ou une résiliation.",
      timing: before,
      priority: "important",
      sourceId: "sp-moving",
      officialUrl: sourceUrl.moving,
      category: "avant",
    });
  }

  return items;
}

export function buildGenericTerminationLetter(input: {
  fullName: string;
  address: string;
  provider: string;
  contractReference: string;
  movingDate: string;
  newAddress: string;
}) {
  const date = input.movingDate ? format(parseISO(input.movingDate), "dd/MM/yyyy") : "[date du déménagement]";
  return `${input.fullName || "[Nom et prénom]"}\n${input.address || "[Adresse actuelle]"}\n\nÀ l’attention de ${input.provider || "[Fournisseur]"}\n\nObjet : demande de résiliation liée à un déménagement\nRéférence du contrat : ${input.contractReference || "[Référence]"}\n\nMadame, Monsieur,\n\nJe vous informe de mon déménagement prévu le ${date} vers l’adresse suivante : ${input.newAddress || "[Nouvelle adresse]"}.\n\nJe souhaite connaître et, si elles sont réunies, appliquer les modalités de résiliation prévues par mon contrat dans cette situation. Merci de me confirmer la date de fin, les éventuels frais, les pièces strictement nécessaires et les modalités de restitution du matériel.\n\nJe vous prie de bien vouloir accuser réception de cette demande.\n\nCordialement,\n${input.fullName || "[Signature]"}`;
}
