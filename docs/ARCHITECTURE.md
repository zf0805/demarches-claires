# Architecture

## Frontend

Les pages publiques sont rendues par Next.js/Vinext. Les parcours `MovingJourney`, `AddressJourney` et `TerminationBuilder` fonctionnent sans compte. Les données non sauvegardées restent en mémoire du navigateur.

## Backend

Les routes sous `app/api` gèrent l’authentification, les données personnelles, l’assistant et les paiements. Les secrets sont lus depuis l’environnement Cloudflare et ne sont jamais inclus dans les composants clients.

## Données

Le schéma D1 est versionné avec Drizzle. Chaque requête utilisateur inclut un filtre par `user_id`. Les sessions utilisent un jeton aléatoire dont seule l’empreinte SHA-256 est conservée. Les mots de passe utilisent PBKDF2-SHA-256 avec 310 000 itérations et un sel aléatoire.

## Flux assistant

Navigateur → `/api/assistant` → validation et limitation de débit → API Responses avec recherche web → filtrage des URLs officielles → réponse structurée avec sources et date.

Si aucune source officielle n’est exploitable, l’API renvoie la phrase de non-confirmation imposée au lieu d’une réponse déduite.

## Flux paiement

Navigateur → création serveur d’une commande ou d’un abonnement → approbation PayPal → capture serveur ou webhook vérifié → statut en base → droit de téléchargement. Le retour navigateur ne suffit jamais à accorder un droit.

## Limites du MVP

- Le limiteur en mémoire réduit les abus simples ; une production multi-instance doit utiliser un stockage distribué.
- L’envoi d’email repose sur une API configurable et doit être validé pour la délivrabilité.
- D1 est l’adaptateur du déploiement Sites. Un déploiement PostgreSQL nécessite l’adaptateur indiqué dans le README.
- Le calendrier `.ics` utilise actuellement la date de déménagement comme repère ; les rappels détaillés doivent être enrichis sans transformer des conseils pratiques en délais légaux.
