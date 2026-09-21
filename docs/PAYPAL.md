# PayPal : Sandbox, Live et incidents

## Sandbox

Configurer les cinq variables `PAYPAL_MODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` et `PAYPAL_PREMIUM_PLAN_ID`. Les prix locaux sont en centimes et peuvent être modifiés dans l’administration après initialisation de la base.

Le webhook doit pointer vers `/api/paypal/webhook` et rester accessible en HTTPS. La signature est vérifiée par l’API de vérification PayPal avant tout traitement. L’identifiant de chaque événement est enregistré pour rendre le traitement idempotent.

## Tests obligatoires

- approbation et capture réussies ;
- annulation par l’acheteur ;
- instrument refusé ;
- erreur serveur ;
- montant ou devise incohérents ;
- notification avec signature invalide ;
- notification reçue deux fois ;
- paiement d’abonnement échoué ;
- annulation d’abonnement ;
- remboursement total administrateur.

## Passage en Live

Créer une application Live distincte, remplacer les secrets, définir `PAYPAL_MODE=live`, recréer le produit, le plan et le webhook Live, puis refaire les tests de bout en bout. Ne pas réutiliser les identifiants Sandbox.

## Incidents

Un échec laisse le paiement dans un statut non actif. Le téléchargement protégé interroge la base côté serveur et accepte uniquement `COMPLETED` pour un paiement unique ou `ACTIVE` pour un abonnement. Le frontend ne peut pas forcer ces états.

Références PayPal : Orders v2, Subscriptions, Webhooks et Payments v2 Refund dans la documentation développeur officielle.
