---
description: Vérifie la DoR, code dans le budget, vérifie la DoD, publie et signale une itération
argument-hint: <numéro de l'itération>
---
Réalise l'itération `$ARGUMENTS` de `ITERATIONS.md`. Les définitions de référence sont dans la section 3 de `CLAUDE.md`.

## 1. Demander le temps restant et vérifier la Definition of Ready (2 minutes au plus)

- Demande au développeur : « Combien de minutes reste-t-il jusqu'à la fin du build ? » Note la réponse et l'heure dans `ITERATIONS.md`. Si le temps ne permet plus cette itération en entier (codage + publication + tour de test), propose de la réduire ou d'en faire la dernière, consacrée au pitch (✂️).
- La section « Itération $ARGUMENTS » existe dans `ITERATIONS.md`, et le plan porte la mention « Plan validé ». Si elle n'est encore que dans « À venir », détaille-la d'abord dans le format de `/planifier-iterations` et fais-la valider.
- L'objectif tient en une phrase, il y a 3 critères d'acceptation au plus, chacun vérifiable.
- En ajoutant les reports de l'itération précédente (son « Bilan ») et les bugs signalés par l'équipe, l'itération respecte encore les règles de taille. Sinon, propose ce que tu reportes (✂️).

Si un point manque, tu ne codes pas : dis lequel (❗️) et ce qu'il faut pour le lever.

## 2. Coder dans le budget de 10 minutes

```bash
mkdir -p .iterations && date +%s > .iterations/$ARGUMENTS.debut
```

- Code le plus petit changement qui satisfait les critères d'acceptation, en reproduisant le prototype de `passation/prototype/index.html`. Choisis librement tes outils et tes procédures : skills, sous-agent `reviewer`, recherche dans le code.
- Après chaque étape significative, affiche le temps écoulé :
  `echo $(( ($(date +%s) - $(cat .iterations/$ARGUMENTS.debut)) / 60 )) min`
- À 8 minutes, c'est l'alarme : pose la question au développeur : « On approche des 10 minutes. Tu préfères finaliser ce qui est en cours, ou t'arrêter là et publier ce qui marche ? » Suis sa réponse, et note un dépassement éventuel pour le bilan. Le hook `alarme-budget.sh` t'interrompt aussi à 8 minutes.
- À la fin du codage, arrête le chrono :
  `date +%s > .iterations/$ARGUMENTS.fin`

## 3. Vérifier la Definition of Done

Reprends les 6 points de la DoD de la section 3 de `CLAUDE.md`, dans l'ordre :

1. Critères d'acceptation : satisfaits, ou reportés dans `ITERATIONS.md`.
2. 1 à 3 tests unitaires Vitest sur la logique métier ajoutée ; `npm test` passe.
3. Contrat [docs/contrat-deployabilite.md](../../docs/contrat-deployabilite.md) respecté : lance `./scripts/verifier-deployabilite.sh`. Une ligne `BORNE` se corrige avant tout (un `.env` ou un secret dans le code déployé, un document de la passation copié dans un service) ; une ligne `ALARME` se traite si le temps le permet, sinon se reporte. Si Docker est disponible sur la VM, ajoute `--construire` : c'est préconisé, pas exigé.
4. Déploiement selon [docs/guidelines-deploiement.md](../../docs/guidelines-deploiement.md) : lis le `/CLAUDE.md` à la racine du serveur (pas celui de ce projet) et suis ses guidelines. S'il est absent ou ne dit pas comment déployer, arrête-toi et dis-le (❗️) : n'invente pas de mécanisme de déploiement.
5. Application en ligne sur `$URL_PUBLIQUE` : demande au développeur de vérifier `$URL_PUBLIQUE/health` et `$URL_PUBLIQUE/sante` dans son navigateur, sans attendre sa réponse pour signaler la version. Si `URL_PUBLIQUE` n'est pas définie, arrête-toi et dis-le (❗️).
6. Signal à PM Lab avec l'outil du harnais : `./scripts/signaler-version.sh $ARGUMENTS`. N'appelle pas `curl` toi-même.
   Le harnais bloque cet appel si le contrat signale une borne ou si `npm test` échoue. Si elle est refusée, lis le message, corrige, recommence. Ne cherche pas à contourner le blocage.

## 4. Mettre à jour la démo (hors DoD)

S'il reste du temps, ajoute les étapes de l'itération à `e2e/demo.spec.ts` : un seul test, le cas passant de bout en bout, des étapes lisibles (`test.step("Je saisis une demande", ...)`), puis `BASE_URL=$URL_PUBLIQUE npm run demo`. Une démo qui échoue se signale, elle ne bloque rien.

Si Playwright n'est pas encore installé dans le dépôt, dis-le (❗️) et installe-le au minimum : `@playwright/test` en dépendance de développement, un `playwright.config.ts` avec Chromium seul et `baseURL` lue dans `BASE_URL` (défaut `http://localhost:3000`), et un script `"demo": "playwright test e2e/demo.spec.ts --headed"`.

## 5. Clore

- Remplis le « Bilan » de l'itération dans `ITERATIONS.md` : durée de codage réelle, dépassement éventuel et décision du développeur, critères satisfaits, ce qui est reporté et à quelle itération, ce que le harnais a bloqué ou refusé, et une ligne **Modifications** : un fichier touché par puce, ce qui a changé et le critère servi. C'est la source de `/expliquer-iteration`.
- Replanifie la suite : avec le temps restant, les reports et les retours de l'équipe, détaille l'itération suivante si elle ne l'est pas, et réordonne « À venir » si besoin. Signale tout changement de priorité (⚠️) : c'est aux cadreurs de le valider.
- Rends en 6 lignes : l'URL, ce qui est démontrable, la durée de codage, ce qui est reporté, ce que l'équipe doit tester dans PM Lab, et la prochaine itération proposée.
- Pour le développeur qui veut comprendre ce qui a été produit : propose `/expliquer-iteration $ARGUMENTS`, sans l'imposer.
