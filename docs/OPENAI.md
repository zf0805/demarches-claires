# Configuration de l’assistant

1. Créer une clé de projet et l’enregistrer uniquement dans `OPENAI_API_KEY` côté serveur.
2. Définir `OPENAI_MODEL` avec un modèle disponible dans le projet et compatible avec l’outil `web_search`.
3. Ne jamais utiliser de variable `NEXT_PUBLIC_` pour une clé secrète.
4. Tester `/api/assistant` avec :
   - une question de changement d’adresse ;
   - « Est-ce légal ? » ;
   - une question à risque élevé ;
   - une demande de falsification ;
   - une question sans source officielle disponible.

L’appel utilise l’API Responses, `store: false`, l’outil de recherche web et l’inclusion des sources de recherche. Les URLs sont filtrées une seconde fois côté serveur avant affichage.

La politique de confidentialité mentionne OpenAI comme prestataire technique. Le nom du prestataire, du modèle et de l’outil n’est pas affiché dans l’interface ou les réponses publiques.

Documentation officielle de référence : https://platform.openai.com/docs/quickstart/make-your-first-api-request et https://developers.openai.com/api/reference/cli/resources/responses/methods/create
