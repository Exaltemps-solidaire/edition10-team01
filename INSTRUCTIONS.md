## Démarrage rapide : hackathon, partie 2

Si vous êtes sur cette page, c'est que vous êtes dans la 2ème partie du hackathon. Sinon, commencez par l'atelier du dossier `exaltemps-solidaire-practice`.

### Le hackathon en bref

- **Partie 1, le cadrage** : chaque équipe a travaillé pour une association dans PM Lab Solidaire. Elle en a tiré une problématique, des idées priorisées, une solution décrite écran par écran, un prototype HTML et les hypothèses à vérifier.
- **Partie 2, le build** (vous êtes ici) : vous transformez ce cadrage en application en ligne, avec Claude Code. Vous ne partez pas d'une page blanche : l'agent reçoit le dossier de l'équipe, la **passation**, et reproduit son prototype.

### Comment vous allez builder

- **Vous pilotez l'agent, il écrit le code.** Vous lancez les commandes, vous répondez à ses questions et vous prenez les décisions qu'il vous soumet.
- **Vous livrez en itérations courtes**, autant que le temps restant le permet. Une itération dure au moins :
  - 10 minutes de codage au plus ;
  - environ 5 minutes de publication ;
  - le tour de test de l'équipe.
- **Chaque itération a un seul objectif**, démontrable en une phrase devant l'équipe, et 3 critères d'acceptation au plus.
- **Chaque itération se termine par une version en ligne** sur `URL_PUBLIQUE`, signalée à PM Lab. Les cadreurs la testent alors dans PM Lab. Une itération qui ne publie rien est une itération perdue.
- **Le goulot, c'est le tour de test de l'équipe, pas le code.** L'agent vous demandera régulièrement combien de minutes il reste avant la fin du build.
- **Un harnais encadre l'agent** :
  - des règles écrites dans `CLAUDE.md` ;
  - des commandes qui enchaînent les étapes ;
  - des contrôles qui bloquent un signal non conforme ;
  - une alarme à 8 minutes de codage, où l'agent vous demande si vous finalisez ou publiez ce qui marche.

**Ce que vous obtenez à la fin** : une application en ligne pour l'association, et un dépôt déployable par la Forge après le hackathon.

### Prérequis

La VM fournit les outils et les variables : vous n'avez rien à installer ni à définir.

- **Outils** : Node.js 24 et npm, `jq`, `curl`, `unzip`, `git` et Docker avec `docker compose`. Sans `jq`, le harnais refuse toutes les commandes du terminal.
- **Variables d'environnement** : `CLE` (la clé de contexte PM Lab) et `URL_PUBLIQUE` (l'adresse publique de votre application) sont déjà configurées.

Ce que vous apportez :

- le code de votre équipe (6 caractères), demandé par `/recuperer-passation` ;
- des cadreurs disponibles pour valider le plan et tester chaque version.

### Les étapes

La VM est préparée avant le hackathon : dépendances installées, navigateur de la démo et variables d'environnement. Tout le build se fait dans son dossier `~/app`.

1. **Vérifiez que vous êtes dans le dossier `~/app`** (`pwd`), sinon tapez `cd ~/app`. **Lancez-y Claude Code** (`claude`), puis tapez les commandes dans l'ordre :

   | Commande | Ce qu'elle fait |
   |---|---|
   | `/recuperer-passation <CODE>` | Télécharge le dossier de votre équipe et le résume |
   | `/planifier-iterations` | Découpe le programme en itérations selon le temps restant et écrit `ITERATIONS.md`. **Validez ce plan avec les cadreurs avant de coder** |
   | `/iteration 1`, puis `2`, `3`… | Code l'itération, la vérifie, la publie, la signale à PM Lab et replanifie la suite |
   | `/expliquer-iteration` (optionnel) | Explique ce que l'itération a produit, pour comprendre l'architecture du code |
   | `/retro-harnais` | En fin de hackathon : ce que le harnais a apporté, ce qui lui a manqué, ce que vous emportez |

2. **Pour montrer l'application** : `BASE_URL=$URL_PUBLIQUE npm run demo` rejoue le cas passant dans Chromium, sur la version en ligne. Sans `BASE_URL`, la démo vise `http://localhost:3000`. Ce n'est pas une suite de tests, c'est la démo du pitch : elle part d'une seule étape (ouvrir l'application), et chaque itération y ajoute les siennes dans `e2e/demo.spec.ts`.

**Comprendre le harnais que vous utilisez** : [HARNAIS.md](./HARNAIS.md), en six questions. C'est fait pour être lu pendant le hackathon et réutilisé après.

Ce que contient le dossier de passation : [docs/passation.md](./docs/passation.md). Les règles de déploiement : [docs/contrat-deployabilite.md](./docs/contrat-deployabilite.md).
