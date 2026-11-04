# Le harnais de ce dépôt, en six questions

Ce fichier est pour toi, builder. Le `CLAUDE.md` parle à l'agent. Ici, on t'explique ce qu'on a construit autour de lui, et pourquoi, pour que tu puisses refaire la même chose sur ta prochaine mission.

## D'abord, qu'est-ce qu'un harnais ?

`Agent = modèle + harnais`. Le modèle sait beaucoup de choses, mais il ne connaît ni ton projet, ni tes règles, ni tes accès. Le harnais, c'est tout ce qu'on construit autour de lui pour qu'il travaille juste : **le processus de l'équipe, rendu exécutable par une machine.**

Une idée à garder en tête pour tout le reste : **le modèle demande, le harnais exécute.** Quand l'agent veut lire un fichier ou lancer une commande, il le demande, et c'est le harnais (ici Claude Code, configuré par ce dépôt) qui le fait. C'est pour ça que le harnais peut dire non.

## Panneau, alarme, borne : la distinction qui compte

Chaque règle d'un harnais prend l'une de ces trois formes. Pense à la route :

- **un panneau** dit la règle : « zone à 70 ». C'est une consigne écrite, que l'agent lit et suit, en général ;
- **une alarme** signale l'écart sur le moment : la voiture sonne parce que tu roules à 90. Tu l'entends tout de suite, mais tu peux l'ignorer et continuer ;
- **une borne** empêche : tu ne passes pas, quelle que soit ta volonté. Le harnais refuse d'exécuter.

Pourquoi un panneau ne suffit pas toujours : seul sur une nationale vide, n'importe quel conducteur est tenté de rester à 90, « il n'y a aucun risque ». Un agent pressé raisonne pareil : « la démo est dans 5 minutes, je modifie le test, ça ira plus vite ». L'alarme lui renvoie l'écart pendant qu'il travaille, pas trois semaines après. Mais **on peut ignorer une alarme, pas une borne** : si l'écart est grave, il faut une borne.

Aucune forme n'est meilleure que les autres. Un panneau est souple et coûte une ligne ; une borne est sûre mais rigide, et ne protège que ce qu'on a pensé à bloquer. **Pour chaque règle importante, choisis sa forme, et assume ce choix.**

## Les six questions

| # | Question | Ce qu'on y met | Porteur |
|---|---|---|---|
| 1 | Sur quoi travaille-t-il ? | le contexte | les cadreurs |
| 2 | Comment doit-il travailler ? | les règles et les procédures | cadreurs et builders |
| 3 | Que peut-il faire ? | les outils | les builders |
| 4 | Que ne peut-il **pas** faire ? | les habilitations | les builders |
| 5 | Quand a-t-il fini ? | la Definition of Done, le budget | cadreurs (le quoi), builders (le comment) |
| 6 | Que retient-on pour la prochaine fois ? | la trace, qui nourrit le guide | tout le monde |

### 1. Sur quoi travaille-t-il ? Le contexte

| Élément | Où | Forme |
|---|---|---|
| La passation de l'équipe (problématique, solution, prototype, hypothèses) | `passation/`, récupérée par `/recuperer-passation` | matière, ni l'un ni l'autre |
| La carte de la passation : quel fichier sert à quoi | `docs/passation.md` | panneau |
| Les décisions d'architecture déjà prises | `adr.md` | panneau |

**Ce qui casse sans :** l'agent construit une application plausible, qui répond à une problématique que personne n'a retenue.

C'est ici que se joue la **Definition of Ready** : avant de commencer, l'agent vérifie que la matière est prête (problématique retenue, au moins un écran décrit, variables définies). Un agent ne dit jamais spontanément « ce n'est pas prêt, je ne commence pas » : il comble les trous en inventant. La DoR, c'est le droit qu'on lui donne de refuser de démarrer.

### 2. Comment doit-il travailler ? Les règles et les procédures

Deux choses différentes vivent ici :

- **les règles** s'appliquent tout le temps, quelle que soit la tâche. Elles sont dans le `CLAUDE.md`, toujours chargé : c'est le guide de l'équipe ;
- **les procédures** (des SOP, procédures standard) disent comment faire une tâche précise, étape par étape. C'est le classeur de procédures de l'équipe.

Les procédures prennent deux formes, qui ne diffèrent que par **qui ouvre la fiche** :

| Forme | Qui la déclenche | Dans ce dépôt |
|---|---|---|
| Règle (`CLAUDE.md`) | personne : toujours active | « une itération, c'est 3 critères d'acceptation au plus » |
| Procédure de type commande (`.claude/commands/`) | toi, en tapant `/…` | `/recuperer-passation`, `/planifier-iterations`, `/iteration`, `/retro-harnais`, et `/expliquer-iteration` en option |
| Procédure de type skill | l'agent, s'il juge que la tâche correspond | `sfd-micro-features`, s'il est installé sur la machine |
| Procédure de type sous-agent (`.claude/agents/`) | l'agent ou toi | `reviewer` (relecture) |

Les étapes du hackathon sont des commandes, pas des skills : c'est toi qui pilotes la séquence, notamment la validation du plan avec les cadreurs.

**Ce qui casse sans :** l'agent suit ses habitudes générales, qui ne sont pas celles de l'équipe.

> **Harnais ou skill ?**
> Un skill est une procédure rangée dans la question 2, parfois avec son kit (un script, c'est un outil ; un document de référence, c'est du contexte). Ce n'est pas un harnais : il n'apporte ni borne, ni vérification, ni trace. Empiler des skills ne fait pas un harnais. Et un skill est un panneau déclenché au jugement du modèle : si une étape doit avoir lieu à coup sûr, elle n'a rien à faire dans un skill.
> Un skill voyage d'un projet à l'autre ; un harnais est situé, il porte les règles d'une équipe. **Le harnais, c'est l'onboarding complet. Le skill, c'est une fiche du classeur.**

### 3. Que peut-il faire ? Les outils

| Outil | Ce qu'il permet | Remarque |
|---|---|---|
| Les outils de Claude Code | lire, chercher, écrire, lancer des commandes | la base |
| Vitest | vérifier le code | sert la question 5 |
| Docker | construire et démarrer l'application en une commande | le `Dockerfile` est exigé dans le dépôt par `docs/contrat-deployabilite.md`, pour la Forge ; construire avec Docker sur la VM est préconisé, si Docker est disponible |
| L'API de PM Lab Solidaire et le contrat, par trois scripts (`scripts/`) | lire la passation, vérifier le contrat de déployabilité, signaler une version prête | **le seul outil qui écrit chez un tiers**. L'agent n'appelle pas `curl` lui-même : il passe par des scripts qui vérifient leurs entrées, et ce sont ces scripts qui sont autorisés |
| Playwright | rejouer la démonstration du cas passant (`npm run demo`) | **ce n'est pas un test**, il ne fait pas partie de la DoD |

**Ce qui casse sans :** rien, l'agent ne fait rien. Mais **chaque outil ajouté élargit ce qu'il peut casser.** C'est ce qui appelle la question 4.

### 4. Que ne peut-il pas faire ? Les habilitations

| Interdit | Où | Forme |
|---|---|---|
| `rm -rf`, `git push --force` | `.claude/settings.json`, `deny` | borne |
| `git add -f`, qui contournerait le `.gitignore` | `.claude/settings.json`, `deny` | borne |
| Lire les fichiers `.env` (sauf `.env.example`) | `.claude/settings.json`, `deny` | borne, **trouée** : l'outil de lecture est bloqué, un `cat .env` dans le terminal passe. Une borne ne protège que ce qu'on a pensé à bloquer |
| `git reset --hard`, `sudo`… | `.claude/settings.json`, `ask` | borne souple : l'agent doit te demander |
| Toute commande hors de la liste `allow` (une dépendance nouvelle, un `git push`…) | `.claude/settings.json`, liste `allow` | alarme : Claude Code te demande la permission. La liste autorise les commandes du harnais (tests, Docker, PM Lab, git add et commit) pour que tu ne valides pas dix commandes par itération |
| Copier un document de `passation/` dans un service déployé | `scripts/verifier-deployabilite.sh`, appelé par le hook avant le signal ; `.gitignore` et refus de `git add -f` si quelqu'un commite quand même | borne |
| Laisser un `.env` ou un secret dans `api/` ou `frontend/` | `scripts/verifier-deployabilite.sh`, appelé par le hook avant le signal | borne : la version ne peut pas sortir |
| Écrire la clé `CLE` dans un fichier | `CLAUDE.md` | panneau seulement |

**Une limite à connaître :** une liste d'autorisations ne protège pas contre le code que l'agent écrit puis exécute. Autoriser `npm test`, c'est autoriser l'exécution des tests qu'il a lui-même écrits. C'est pour ça que les autorisations sont précises (des scripts exacts, `docker compose run` et `exec` interdits), et que l'on travaille dans un **environnement isolé** : ta VM. Ce n'est pas seulement une borne de dernier recours, c'est une étape de la procédure standard : on construit et on teste dans un environnement isolé, sans rien d'autre à abîmer, avant que la Forge déploie ailleurs.

**Une borne trouée, en exemple :** `docker run` et `docker exec` sont interdits, mais `docker compose up` reste autorisé et exécute le `compose.yaml` écrit par l'agent, qui peut déclarer `privileged: true` ou monter la racine de la VM. La règle `deny` n'ajoute presque rien : c'est l'isolement de la VM qui protège.

**Ce qui casse sans :** une consigne ignorée sous pression (« la démo est dans 5 minutes »). C'est le moment où l'agent est le plus compétent qui le rend le plus dangereux.

### 5. Quand a-t-il fini ? La Definition of Done et le budget

En Agile, la DoD est un accord entre humains : on s'engage, et l'écart se voit en rétro. Un agent n'a pas cette discipline collective, et il a un biais connu : **il dit « fini » trop tôt.** Avec un agent, la DoD devient la condition de sortie de la boucle, et la vraie question est : **quels points le harnais vérifie-t-il lui-même ?**

La DoD d'une itération (détail dans la section 3 du `CLAUDE.md`) :

| Point | Forme |
|---|---|
| En continu : le code passe eslint après chaque écriture | alarme : le hook `PostToolUse` renvoie l'erreur à l'agent, qui peut l'ignorer |
| 1. Critères d'acceptation satisfaits, ou reportés par écrit | panneau |
| 2. 1 à 3 tests unitaires, `npm test` passe | **borne** |
| 3. Contrat de déployabilité respecté (`scripts/verifier-deployabilite.sh`) | **borne** pour les `.env` et les secrets ; **alarme** pour le reste (Dockerfile, `.env.example`, routes de santé, `DEPLOIEMENT.md`) ; construction Docker préconisée si Docker est disponible |
| 4. Application déployée selon `docs/guidelines-deploiement.md` (le `/CLAUDE.md` à la racine du serveur) | panneau |
| 5. Application en ligne, `/health` et `/sante` répondent 200 | panneau : le développeur le confirme depuis son navigateur, sans que ce soit bloquant |
| 6. Version signalée à PM Lab | c'est la porte de sortie |

La borne : le hook `.claude/hooks/verifier-avant-signal.sh` refuse le signal à PM Lab tant qu'un `.env` ou un secret se trouve dans le code déployé ou que les tests échouent. L'agent peut affirmer ce qu'il veut, il ne peut pas sortir.

**Le budget** de 10 minutes de codage est volontairement un **panneau doublé d'une alarme** : à 8 minutes, l'alarme sonne (hook `.claude/hooks/alarme-budget.sh`), et l'agent te demande si tu préfères finaliser ou t'arrêter et publier. C'est toi qui décides. Les 10 minutes sont un plafond, pas une cible : une itération de 3 minutes, c'est très bien.

**Le temps restant** n'est jamais supposé : l'agent te demande combien de minutes il reste avant la fin du build, au moment de planifier puis à chaque itération, parce que l'heure de fin peut bouger. Il fait autant d'itérations que le temps le permet, et replanifie à la fin de chacune. Le goulot n'est pas le code, c'est le tour de test de l'équipe dans PM Lab. Avec un budget serré, une itération peut être finie sans que tous ses critères le soient : on publie ce qui marche, on reporte le reste. C'est différent de la DoD Scrum, et c'est voulu.

**Ce qui casse sans :** un « c'est fait » sans rien en ligne, ou une itération qui dure 40 minutes.

### 6. Que retient-on pour la prochaine fois ? La trace

| Trace | Où | Pour qui |
|---|---|---|
| Une ligne par action de l'agent | `.iterations/trace.jsonl` (hook `.claude/hooks/tracer.sh`, non commité) | `/retro-harnais` |
| Le bilan de chaque itération : durée, dépassement, reports, refus | `ITERATIONS.md` | l'équipe |
| Le bilan du harnais | `RETRO-HARNAIS.md`, produit par `/retro-harnais` | toi |

Tout tracer ne sert à rien sans lecteur. La trace sert à répondre à des questions (qu'a-t-il fait, qu'est-ce qu'on lui a refusé, combien de temps) et surtout à **nourrir le guide** : un refus qui revient sans cesse, c'est une règle qui manque. Le harnais n'est pas une photo, il grandit avec ce que la trace révèle.

**Ce qui casse sans :** on ne sait pas ce qui s'est passé, donc on ne peut rien améliorer.

## Dans VS Code : les mêmes étapes, et des options pour comprendre

Si tu lances Claude Code dans VS Code, le harnais est **identique** : même moteur, mêmes commandes, même `CLAUDE.md`, mêmes permissions, mêmes hooks. Tes étapes ne changent pas. Deux précautions :

- ouvre **la racine du dépôt** comme dossier de travail : Claude Code la transmet aux hooks (`$CLAUDE_PROJECT_DIR`), qui s'y placent même si l'agent a changé de dossier ;
- vérifie que l'agent voit `CLE` et `URL_PUBLIQUE` : selon la façon dont VS Code est ouvert, il ne charge pas toujours les variables du terminal.

VS Code te donne en plus de quoi **voir l'architecture du code produit**. Tout est optionnel :

| Moment | Ce que tu peux faire | Ce que tu y gagnes |
|---|---|---|
| Pendant l'itération | relire chaque modification dans la vue des différences avant de l'accepter | tu vois le code naître |
| Fin d'itération | `/expliquer-iteration` : l'agent explique l'itération à partir de `ITERATIONS.md` (quels fichiers, pourquoi, quel critère chacun sert), et complète le bilan s'il ne suffit pas | tu comprends l'architecture sans tout lire |
| Fin d'itération | demander au sous-agent `reviewer` de relire les fichiers de l'itération | un second regard, indépendant de l'agent qui a codé |
| Au fil de l'eau | onglet Source Control : comparer l'itération N à N-1 | tu vois l'architecture grandir |
| À tout moment | ouvrir `.iterations/trace.jsonl` | tu vois ce que fait l'agent, action par action |

## Conclusion : libre dans le chemin, contrôlé aux portes

Un workflow fixe le chemin à l'avance : étape 1, puis 2, puis 3. Un agent compose son chemin pendant l'exécution, selon la situation, en choisissant parmi les outils et les procédures disponibles. C'est ce qui le distingue d'un script, et c'est exactement le principe du **case management adaptatif** (CMMN) :

| Case management (CMMN) | Ce harnais |
|---|---|
| Le dossier du cas | le contexte : `passation/`, `ITERATIONS.md` |
| Les étapes (stages) | les itérations, replanifiées selon le temps restant |
| Les tâches discrétionnaires | les outils, les skills, le sous-agent `reviewer`, que l'agent choisit |
| Les critères d'entrée (sentries) | la Definition of Ready |
| Les critères de sortie et les jalons | la Definition of Done, gardée par le hook |
| Le gestionnaire du cas | l'agent, sous ton regard |

Ce qui rend cette liberté sans danger, c'est que **les bornes ne sont pas dans les procédures**. Elles sont aux points de passage : les permissions, les hooks, la DoD. Un hook ne sait pas quelle procédure l'agent suit ; il voit passer une action et la laisse passer ou la bloque. On peut donc laisser l'agent recomposer ses procédures, parce que les portes sont gardées. Si toute la sécurité reposait sur les procédures, on n'oserait jamais le laisser improviser.

Deux conséquences :

- plus le chemin est libre, plus **la trace** compte : c'est la seule façon de savoir par où il est passé ;
- l'agent ne compose qu'avec les procédures qu'il connaît : **la description d'un skill** est ce qui décide s'il sera ouvert, ou pas.

Ce harnais est un **cas cadré** : un workflow au niveau du hackathon (des itérations que tu déclenches, un plan validé par les cadreurs), un cas à l'intérieur de chaque itération (l'agent compose librement, la DoD garde la sortie). On choisit le degré de liberté selon le risque et la maturité de l'équipe. Sur ta prochaine mission, ce curseur sera ailleurs, et c'est normal.

**À emporter :** on ne contraint pas le chemin, on garde les portes et la sortie.
