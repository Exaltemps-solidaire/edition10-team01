# Contrat de déployabilité des dépôts eXaltemps Solidaire

> Copie de `30_Notoriete/exaltemps/solidaire/06_livrables/2026-10-23_contrat-deployabilite.md`, version 0.1 du 2026-10-23, qui fait foi. En attente de validation par la Forge.
> Dans ce harnais : la construction Docker sur la VM est une **préconisation, si Docker est disponible** ; le `Dockerfile` reste exigé dans le dépôt, pour la Forge. Les vérifications sont outillées par `scripts/verifier-deployabilite.sh`.
> Destiné au harnais de l'agent de développement des builders : ce texte se colle tel quel
> dans le `CLAUDE.md` du poste de développement.
> But : que chaque dépôt produit pendant le hackathon puisse être déployé sur AWS par l'agent
> de la Forge, sans intervention humaine et sans deviner comment le lancer.

---

## Règles de déploiement (à respecter dans tout dépôt de l'équipe)

Le dépôt sera repris après le hackathon par un agent qui le déploie, le surveille et le corrige
pour l'association. Il ne lit que ce que tu laisses dans le dépôt. Respecte les règles suivantes
dès le premier commit, pas à la fin.

### 1. Se construire et démarrer en une commande

- À la racine, un `Dockerfile` (un seul service) ou un `docker-compose.yml` (plusieurs services).
  C'est obligatoire, y compris pour un site statique (une image `nginx` suffit).
- `docker compose up --build` (ou `docker build` puis `docker run`) démarre l'application sur une
  machine vierge, sans aucune étape manuelle : pas de commande à taper avant, pas de fichier à
  copier à la main, pas de base à initialiser à la main.
- Versions figées : image de base avec une version précise (`node:22-alpine`, pas `node:latest`),
  fichier de verrouillage des dépendances commité (`package-lock.json`, `requirements.txt` avec
  versions).

### 2. Toute la configuration passe par des variables d'environnement

- Un fichier `.env.example` à la racine liste **toutes** les variables lues par l'application,
  chacune avec une ligne de commentaire et une valeur factice.
- Le fichier `.env` n'est **jamais** commité : il figure dans `.gitignore`.
- Les variables lues **au moment du build** (`NEXT_PUBLIC_*`, `VITE_*`, `ARG` du `Dockerfile`)
  sont regroupées dans une section à part de `.env.example`, intitulée `# Build`. Changer leur
  valeur impose de reconstruire l'image : l'agent de déploiement doit le savoir.

### 3. Aucun secret dans le dépôt

- Aucune clé, aucun mot de passe, aucun jeton dans le code, les fichiers de configuration,
  les images, ni l'historique git.
- Une clé exposée par erreur est considérée comme compromise : la signaler, elle sera changée.
  La supprimer dans un commit suivant ne suffit pas.

### 4. Aucune adresse en dur

- Pas de domaine, d'adresse IP, de nom de conteneur ou de chemin propre à une machine dans le
  code. L'URL publique de l'application, l'URL de l'API et l'URL du service d'IA sont des
  variables.
- Les appels à un modèle d'IA passent par deux variables : `LLM_BASE_URL` et `LLM_API_KEY`
  (et `LLM_MODELE` si le modèle est réglable).

### 5. Un seul point d'entrée, une route de santé

- Un seul service est exposé au public. Il écoute sur le port donné par la variable `PORT`,
  déclaré aussi par `EXPOSE` dans son `Dockerfile`.
- Il répond `200` sur `GET /health` et sur `GET /sante` quand il est prêt à servir : sans
  authentification, sans appel externe payant, en moins d'une seconde. `/health` est la convention
  attendue par la plupart des plateformes ; `/sante` est gardée pour les équipes. Pour un site
  statique, deux fichiers `health` et `sante` suffisent.

### 6. Des données qui survivent à un redémarrage

- Une base de données est un service du `docker-compose.yml`, sur une image officielle
  (`postgres:16-alpine`), avec un volume nommé.
- Le schéma se crée et se met à jour seul au démarrage de l'application (migrations au boot).
- Tout fichier qui doit persister (téléversements, exports) est écrit dans un volume nommé
  déclaré dans le compose, nulle part ailleurs.
- Aucune donnée personnelle réelle dans le dépôt, y compris dans les données de démonstration.

### 7. Des journaux lisibles par un agent

- L'application écrit ses journaux sur la sortie standard et la sortie d'erreur, jamais dans un
  fichier.
- Une erreur journalisée dit ce qui a échoué et sur quoi (« appel au modèle refusé : 401 »),
  pas seulement une pile d'appels.

### 8. Un fichier `DEPLOIEMENT.md` à la racine

Une page au plus, pour l'agent qui reprendra le dépôt :

- ce que fait l'application, en deux phrases, et pour quelle association ;
- la liste des services et celui qui est exposé ;
- les services externes appelés (IA, e-mail, cartes, paiement) et ce qui casse si l'un tombe ;
- ce qui est connu comme fragile ou inachevé ;
- la personne à contacter côté équipe et côté association.

---

## Vérification avant de rendre le dépôt

Lance ces vérifications et corrige tant qu'une seule échoue :

```bash
# 1. Le dépôt se construit et démarre sur une base propre
docker compose down -v && docker compose up --build -d

# 2. La route de santé répond
curl -fsS http://localhost:${PORT:-8080}/health && curl -fsS http://localhost:${PORT:-8080}/sante

# 3. Aucun fichier .env n'est suivi par git
git ls-files | grep -E '(^|/)\.env$' && echo "ÉCHEC : .env commité"

# 4. Aucun secret visible (motifs courants)
git grep -nIE 'sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY' \
  $(git rev-list --all) && echo "ÉCHEC : secret probable"

# 5. Chaque variable lue par le code figure dans .env.example (à relire à la main)
```

---

## Points ouverts pour la Forge

- **Applications mobiles** : seule la partie serveur se déploie avec ce contrat. Faut-il imposer
  une application web installable (PWA) plutôt qu'une application native ?
- **Accès aux modèles d'IA** : quelle passerelle fournit `LLM_BASE_URL` et une clé par
  association, avec un budget ?
- **Contrôle automatique** : la Forge vérifie-t-elle ce contrat elle-même à l'entrée (et refuse
  un dépôt non conforme), ou corrige-t-elle les écarts ?
