# Checklist à faire valider avant commercialisation

Ce document n’est pas une certification. Il doit être relu par un avocat français et, selon l’organisation, par un spécialiste RGPD ou un DPO.

## Positionnement et information juridique

- [ ] Confirmer que toutes les pages affichent une indépendance suffisante et ne créent aucune confusion avec l’État.
- [ ] Valider les formulations sur les limites de l’assistant, les sujets sensibles et les questions « Est-ce légal ? ».
- [ ] Vérifier que les modèles de courriers ne sont pas présentés comme des conseils juridiques personnalisés.
- [ ] Auditer les sources, leurs titres, leur date de vérification et la procédure de désactivation.
- [ ] Définir la fréquence de revue des démarches susceptibles de changer.
- [ ] Vérifier les règles applicables à l’information juridique en ligne et au courtage éventuel de services.

## Éditeur, consommation et paiement

- [ ] Compléter toutes les mentions légales avec l’entité réelle et l’hébergeur.
- [ ] Valider les CGU/CGV, le processus de commande et l’information précontractuelle.
- [ ] Déterminer le droit de rétractation applicable au dossier numérique et à l’abonnement.
- [ ] Valider renouvellement, résiliation, remboursement, facturation, TVA et preuve du consentement.
- [ ] Vérifier la conformité du bouton de commande et des confirmations PayPal.
- [ ] Définir la politique de gestion des impayés et contestations.

## RGPD et cookies

- [ ] Identifier le responsable de traitement, le DPO/référent et les coordonnées d’exercice des droits.
- [ ] Tenir un registre des traitements et documenter chaque finalité, base légale et durée.
- [ ] Valider la minimisation des données et l’absence de documents sensibles dans le MVP.
- [ ] Réaliser une analyse d’impact si le traitement réel le justifie.
- [ ] Documenter les sous-traitants, contrats, lieux de traitement et mécanismes de transfert.
- [ ] Vérifier les paramètres de conservation de l’API d’IA et l’option `store: false`.
- [ ] Interdire l’entraînement sur les conversations sans consentement explicite et base légale.
- [ ] Fixer les durées pour comptes, conversations, logs, paiements et sauvegardes.
- [ ] Tester export, rectification, suppression, anonymisation comptable et restauration.
- [ ] Mettre en place un véritable centre de préférences si des traceurs non nécessaires sont ajoutés.
- [ ] Vérifier que les cookies de session et de consentement respectent les recommandations de la CNIL.

## Sécurité et exploitation

- [ ] Réaliser une revue de code et un test d’intrusion avant ouverture publique.
- [ ] Remplacer le limiteur en mémoire par un système distribué résistant aux instances multiples.
- [ ] Mettre en place rotation des secrets, MFA administrateur, alertes, sauvegardes et plan d’incident.
- [ ] Tester l’isolation entre utilisateurs et l’impossibilité d’énumérer les comptes.
- [ ] Tester CSRF, XSS, injections, fixation de session, bruteforce et téléchargements non autorisés.
- [ ] Tester les erreurs et doublons de webhooks PayPal.
- [ ] Documenter une procédure de violation de données et les délais de notification.

## Accessibilité et marketing

- [ ] Faire un audit RGAA/accessibilité, navigation clavier, contraste, zoom 200 % et lecteurs d’écran.
- [ ] Vérifier les allégations commerciales, prix, FAQ et contenus SEO.
- [ ] S’assurer qu’aucune page SEO pauvre ou répétitive n’est publiée automatiquement.
