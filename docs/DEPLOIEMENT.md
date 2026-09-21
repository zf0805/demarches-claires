# Déploiement

## Préproduction

1. Configurer les variables d’environnement sans les copier dans Git.
2. Appliquer les migrations Drizzle et vérifier le schéma.
3. Créer un premier administrateur par une procédure contrôlée, puis remettre le rôle par défaut à `user`.
4. Configurer les domaines de l’assistant, l’email transactionnel et PayPal Sandbox.
5. Exécuter tests, lint, contrôle de secrets et build.
6. Déployer en accès privé et réaliser les parcours principaux sur mobile et ordinateur.

## Production

1. Finaliser l’identité de l’éditeur, le domaine, l’adresse de support et l’hébergeur dans les mentions légales.
2. Faire valider la checklist juridique/RGPD.
3. Basculer PayPal vers Live et recréer les ressources Live.
4. Configurer la sauvegarde, la purge et la surveillance des erreurs.
5. Activer l’accès public seulement après recette et revue professionnelle.

## Retour arrière

Publier la version applicative précédente sans réécrire une migration déjà appliquée. Pour une correction de schéma, ajouter une nouvelle migration réversible et testée. Révoquer immédiatement toute clé suspectée d’exposition.
