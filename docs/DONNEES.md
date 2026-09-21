# Exploitation des données

## Sauvegarde

1. Planifier un export chiffré de D1 au minimum quotidien lorsque le service devient commercial.
2. Conserver les sauvegardes dans une région et pour une durée validées par le responsable RGPD.
3. Tester la restauration sur un environnement isolé au moins trimestriellement.
4. Journaliser l’opération sans copier les contenus personnels dans les logs.

## Suppression

La suppression du compte efface sessions, démarches et conversations. Les paiements sont dissociés de l’utilisateur lorsque leur conservation répond à une obligation comptable. Les délais et la méthode d’anonymisation doivent être validés avant commercialisation.

## Purge automatique

Programmer un appel authentifié à `/api/cron/purge`. La tâche supprime les conversations expirées, sessions expirées et jetons d’authentification usés ou expirés. La durée de conversation cible est configurable avec `CONVERSATION_RETENTION_DAYS`; elle doit aussi être appliquée lors de la création d’une conversation si cette sauvegarde est activée.

## Demandes de droits

Le tableau de bord fournit l’export et la suppression en libre-service. Les demandes complémentaires sont reçues par le formulaire de contact et doivent suivre une procédure interne d’identification proportionnée.
