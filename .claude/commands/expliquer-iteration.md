---
description: (Optionnel) Explique une itération à partir de ITERATIONS.md, pour comprendre l'architecture produite
argument-hint: [numéro de l'itération ; la dernière par défaut]
---
Explique au développeur ce qui a été produit pendant l'itération `$ARGUMENTS` (la dernière si rien n'est précisé). La source de référence est `ITERATIONS.md` : une itération n'a pas forcément de commit. Tu ne modifies qu'un seul fichier, `ITERATIONS.md`, et seulement si son bilan est insuffisant (étape 2).

1. Lis la section « Itération $ARGUMENTS » de `ITERATIONS.md` : objectif, critères d'acceptation, fichiers prévus, tests prévus et « Bilan ».
2. Le bilan suffit s'il dit quels fichiers ont été modifiés et pourquoi, quel critère chacun sert, et ce qui est provisoire. S'il ne le dit pas, reconstitue les modifications, dans cet ordre :
   - `.iterations/trace.jsonl` : les lignes `Write` et `Edit` entre `.iterations/$ARGUMENTS.debut` et `.iterations/$ARGUMENTS.fin` donnent les fichiers touchés ;
   - le contenu actuel de ces fichiers, et `git diff` ou `git log` s'ils apportent quelque chose ;
   - puis complète le « Bilan » de l'itération dans `ITERATIONS.md` sous une ligne **Modifications** : un fichier par puce, ce qui a changé et le critère servi. Tu ajoutes, tu ne réécris pas ce qui y est déjà. Si tu ne peux pas savoir pourquoi un fichier a changé, écris « je ne sais pas » plutôt que d'inventer.
3. Explique en 15 lignes au plus :
   - **ce que l'itération ajoute**, en une phrase, et le critère d'acceptation que sert chaque fichier touché ;
   - **où ça se place dans l'architecture** : quelle couche (page, composant, logique métier, route d'API, données), et comment les fichiers s'appellent entre eux. Si ça aide, ajoute un petit schéma en texte ;
   - **la logique métier** et le test qui la protège ;
   - **ce qui est provisoire** (données en dur, raccourci pris pour tenir le budget), à reprendre plus tard.
4. Termine par deux pistes de lecture : les deux fichiers qu'un développeur devrait ouvrir en premier pour comprendre, dans l'ordre. Si tu as complété `ITERATIONS.md`, dis-le en une ligne.

Si le développeur veut un second regard, propose de lancer le sous-agent `reviewer` sur les fichiers de l'itération.
