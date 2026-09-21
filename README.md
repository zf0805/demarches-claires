# Démarches Claires

MVP français, privé et indépendant pour comprendre et préparer les démarches liées à un déménagement. Le nom et les couleurs sont centralisés dans `lib/brand.ts` et `app/globals.css`.

> Ce produit ne constitue pas une certification juridique. Les pages légales et le modèle commercial doivent être relus avant toute mise en production.

## Architecture

- Next.js 16 / Vinext, React 19 et TypeScript
- routes serveur compatibles Cloudflare Workers
- D1/SQLite via Drizzle pour l’hébergement Sites ; la couche de données reste isolée pour permettre un adaptateur PostgreSQL ultérieur
- authentification email/mot de passe PBKDF2, sessions serveur `HttpOnly` et vérification email
- API Responses côté serveur avec recherche web limitée aux domaines officiels
- intégration PayPal REST (Orders, Subscriptions, webhooks et remboursements)
- composants accessibles et styles Tailwind

La décision D1 est spécifique au déploiement Sites. Pour un déploiement autonome avec PostgreSQL, remplacer `db/schema.ts` par le dialecte PostgreSQL et les accès D1 de `lib/auth.ts` par un dépôt Drizzle/Postgres.

## Installation

Prérequis : Node.js 22.13 ou plus récent.

```bash
npm ci
cp .env.example .env.local
npm run db:generate
npm run dev
```

Le site local est disponible sur l’URL affichée par le serveur, généralement `http://localhost:5173`.

## Variables d’environnement

Copier `.env.example`, ne jamais committer `.env.local` et stocker les valeurs de production dans le gestionnaire de secrets de l’hébergeur. `OPENAI_API_KEY` et `PAYPAL_CLIENT_SECRET` ne doivent jamais utiliser le préfixe `NEXT_PUBLIC_`.

## Base de données

Le schéma se trouve dans `db/schema.ts`. Les migrations sont générées dans `drizzle/` :

```bash
npm run db:generate
```

Inspecter chaque migration avant publication. L’hébergement Sites applique les migrations versionnées. Ne jamais modifier une migration déjà appliquée ; créer une migration supplémentaire.

## Assistant

Configurer `OPENAI_API_KEY` et, si nécessaire, `OPENAI_MODEL`. L’endpoint `/api/assistant` :

- utilise l’API Responses côté serveur avec `store: false` ;
- active la recherche web et limite les domaines aux sources officielles autorisées ;
- rejette les demandes de fraude ;
- limite les sujets à risque élevé à de l’information générale ;
- refuse d’affirmer une information quand aucune source officielle n’est récupérée.

Voir `docs/OPENAI.md`.

## PayPal Sandbox

1. Créer une application REST Sandbox dans le tableau de bord développeur PayPal.
2. Renseigner `PAYPAL_MODE=sandbox`, `PAYPAL_CLIENT_ID` et `PAYPAL_CLIENT_SECRET`.
3. Créer un produit et un plan mensuel, puis renseigner `PAYPAL_PREMIUM_PLAN_ID`.
4. Ajouter le webhook public `/api/paypal/webhook` et renseigner son ID dans `PAYPAL_WEBHOOK_ID`.
5. Souscrire aux événements de capture, remboursement, abonnement activé/annulé/suspendu/expiré et paiement d’abonnement échoué.
6. Tester les cas négatifs avant le passage en Live.

Voir `docs/PAYPAL.md`.

## Qualité et sécurité

```bash
npm test
npm run lint
npm run security:check
npm run build
```

Les tests couvrent la personnalisation de la checklist, l’absence de conclusion binaire sur une question de légalité, la réponse sans source fiable, les domaines autorisés et le refus des captures PayPal échouées ou incohérentes.

## Déploiement

Le projet contient `.openai/hosting.json` pour Sites. Configurer les secrets dans l’environnement hébergé, appliquer la migration, exécuter le build, puis publier une version privée de validation avant d’ouvrir l’accès. La procédure complète figure dans `docs/DEPLOIEMENT.md`.

## Sauvegarde, export et suppression

- Sauvegarde : exporter régulièrement la base D1 via l’outil de sauvegarde de l’hébergeur et tester la restauration.
- Export utilisateur : `GET /api/account` renvoie un fichier JSON au propriétaire connecté.
- Suppression utilisateur : `DELETE /api/account` supprime les contenus et dissocie les écritures de paiement.
- Purge : appeler `POST /api/cron/purge` avec `Authorization: Bearer $CRON_SECRET` selon la fréquence choisie.

Voir `docs/DONNEES.md` et `docs/VALIDATION-JURIDIQUE-RGPD.md` avant production.
