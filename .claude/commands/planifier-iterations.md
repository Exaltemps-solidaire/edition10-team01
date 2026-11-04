---
description: Découpe le programme en itérations courtes, selon le temps restant, avant tout code
---
Découpe le programme de l'équipe en itérations courtes. Tu ne codes rien dans cette commande.

## 1. Vérifier la Definition of Ready du hackathon

Relis la section 3 de `CLAUDE.md`. Vérifie chaque point de la DoR du hackathon : passation récupérée, problématique retenue, au moins un écran décrit ou un prototype, variables `CLE` et `URL_PUBLIQUE` définies. Si un point manque, dis lequel (❗️) et ce qu'il faut pour le lever, puis arrête-toi. Si `passation/` n'existe pas, propose `/recuperer-passation <CODE>`.

## 2. Demander le temps

Pose deux questions au développeur, et attends ses réponses :
- « Combien de minutes reste-t-il jusqu'à la fin du build ? »
- « Combien de temps dure un tour de test de l'équipe dans PM Lab ? » (10 minutes s'il ne sait pas)

Calcule la capacité : une itération dure au moins son temps de codage (10 minutes au plus) + environ 5 minutes de publication + le tour de test. Ne suppose jamais l'heure de fin : elle peut changer, et tu la redemanderas à chaque itération.

## 3. Reprendre le plan de l'équipe s'il existe

Cherche dans la passation un plan d'itérations fait par l'équipe dans PM Lab : un fichier de `cadrage/` dont le nom contient `iteration`, ou une clé `iterations` dans `passation.json`. S'il existe :
- reprends-le tel quel dans `ITERATIONS.md`, dans le format ci-dessous ;
- vérifie la DoR de chaque itération, les règles de taille, et qu'il tient dans le temps restant ;
- signale chaque écart (⚠️) avec une proposition, sans réécrire le plan de l'équipe. Passe ensuite à l'étape 6.

## 4. Sinon, découper

Pars de `passation/cadrage/3-solution.md`, de `passation/prototype/index.html` et de `passation/cadrage/5-hypotheses.md`. Respecte l'ordre de priorité de `2-idees-priorisees.md` et exclus ce que `matiere/arbitrages.md` écarte.

- **Itération 1** : le squelette publié. L'application démarre selon le contrat de déployabilité et le gabarit du serveur (services `api/` et `frontend/` déjà posés ; reste `.env.example` et `DEPLOIEMENT.md`), est en ligne, et montre l'écran principal du cas passant, même avec des données en dur.
- **Itérations suivantes** : le cas passant devient réel, un objectif démontrable par itération, dans l'ordre de priorité de l'équipe. Un petit objectif fait une itération courte : 3 minutes de codage, c'est très bien.
- **Dernière itération** : quand le temps restant ne permet plus qu'une itération, elle sert à stabiliser ce qui sera montré au pitch.

Détaille seulement **les deux ou trois prochaines itérations**. Le reste est une liste ordonnée d'objectifs, détaillés au fil de l'eau : le plan sera revu à la fin de chaque itération, avec le temps restant et les retours de l'équipe.

Si le périmètre ne tient pas dans le temps restant, dis-le (✂️) et liste ce qui sort, au lieu de grossir les itérations.

Si le skill `anthropic-skills:sfd-micro-features` est disponible, tu peux t'en servir pour formuler les critères d'acceptation. Les règles de taille de la section 3 de `CLAUDE.md` priment sur sa sortie.

## 5. Écrire `ITERATIONS.md`

En tête :
- la source du plan (« plan de l'équipe dans PM Lab » ou « proposé par l'agent ») ;
- le temps restant annoncé, l'heure de la question, la durée du tour de test ;
- ce qui sort du périmètre.

Pour chaque itération détaillée :

```markdown
## Itération N : <objectif en une phrase, démontrable devant l'équipe>

- **Dans le périmètre** : ...
- **Hors périmètre** : ...
- **Critères d'acceptation** (3 au plus, chacun vérifiable) :
  - Étant donné ..., quand ..., alors ...
- **Hypothèse de l'équipe couverte** : ... (ou « aucune », justifié)
- **Codage estimé** : ... minutes (10 au plus)
- **Fichiers prévus** : ... (5 environ au plus, hors tests)
- **Tests unitaires prévus** : 1 à 3, sur ...
- **Étapes ajoutées à la démo** : ...
- **Bilan** : _à remplir en fin d'itération (durée de codage réelle, dépassement éventuel, fait, reporté, modifications fichier par fichier)_
```

Puis la section « À venir » : la liste ordonnée des objectifs suivants, une ligne chacun.

## 6. Rendre la main

Présente le plan en une ligne par itération détaillée, plus la liste « À venir », avec le nombre d'itérations que le temps permet. Signale les points incertains (⚠️ ou ❓). Puis **arrête-toi** : le développeur valide le plan avec les cadreurs avant `/iteration 1`. Intègre leurs corrections dans `ITERATIONS.md` si on te les donne, et note en tête « Plan validé le <date> ».
