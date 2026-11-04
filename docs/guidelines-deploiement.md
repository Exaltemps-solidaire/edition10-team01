# Guidelines de déploiement

Ce fichier ne décrit pas comment déployer l'application : il dit **où** se trouvent les consignes.

## La source qui fait foi

Le déploiement suit les guidelines du fichier **`/CLAUDE.md` à la racine du serveur** (la VM qui expose l'application sur `URL_PUBLIQUE`), et **non** le `CLAUDE.md` de ce projet.

- Le `CLAUDE.md` de ce dépôt cadre le hackathon (itérations, DoR, DoD). Il ne dit pas comment déployer.
- Le `/CLAUDE.md` du serveur décrit comment l'application y est construite, démarrée et exposée. En cas de contradiction avec ce dépôt, c'est lui qui s'applique pour le déploiement.

## Ce que fait l'agent

1. Lire `/CLAUDE.md` à la racine du serveur avant chaque déploiement : il peut changer en cours de hackathon.
2. Déployer en suivant ces guidelines, sans ajouter d'étape qu'elles ne décrivent pas.
3. Faire confirmer ensuite par le développeur que l'application est en ligne : `$URL_PUBLIQUE/health` et `$URL_PUBLIQUE/sante` répondent depuis son navigateur.

## Dérogation : pas de commit ni de push

Le déploiement passe uniquement par la core-platform. On applique la recette du `/CLAUDE.md` du serveur **jusqu'à son étape 5 (« Vérifier ») incluse**, et on s'arrête là : on **ne commite pas et on ne pousse pas**, contrairement à la ligne « Puis commite et pousse » de la recette. C'est le seul point sur lequel ce dépôt l'emporte sur le fichier du serveur.

## Si le fichier est absent ou incomplet

Si `/CLAUDE.md` n'existe pas à la racine du serveur, ou s'il ne dit pas comment déployer, l'agent s'arrête et le signale (❗️). Il n'invente pas de mécanisme de déploiement.

## Ce que le dépôt prévoit pour la recette du serveur

Le `/CLAUDE.md` du serveur reste la référence. Le squelette est déjà taillé pour lui :

| Le serveur demande | Dans ce dépôt |
|---|---|
| un service `api/`, construit par `podman build ... api/`, sur le port 8081 | `api/` : Node sans dépendance, `api/Dockerfile`, `GET /health` et `/sante` sur 8081 |
| un service `frontend/`, construit par `podman build ... frontend/`, sur le port 80 du conteneur (8080 sur la VM) | `frontend/` : Next.js en export statique servi par nginx, `frontend/Dockerfile`, `/health` et `/sante` en fichiers statiques |
| le front appelle l'API en chemin relatif, sur une seule origine | les routes métier de l'API se déclarent sous `/api/v1/...`, appelées par `fetch("/api/v1/...")` |
| `/api/` et `/_reveil` réservés au proxy d'entrée | aucune page du front sous ces chemins |
| les assets passent par l'API | une route `/api/v1/media/...` le jour où il en faut |

Restent à faire sur la VM, avec la recette : copier `podman-compose.yml`, `.gitlab-ci.yml` et `bootstrap.sh` depuis le gabarit, et comparer les deux `Dockerfile` avec ceux de `CCOE-RULES.md` §3.2, qui l'emportent.

En développement, `next dev` ne relaie pas `/api/` vers l'API : un export statique n'a pas de réécritures. Pour tester le front avec l'API, passe par `podman compose` (port 8080).

## Ce qui ne change pas

- Le contrat [contrat-deployabilite.md](./contrat-deployabilite.md) s'applique toujours au dépôt (Dockerfile, `.env.example`, routes de santé, `DEPLOIEMENT.md`), pour la Forge.
- Aucun secret ni la clé `CLE` ne s'écrit dans un fichier, même si une étape de déploiement le suggère.
