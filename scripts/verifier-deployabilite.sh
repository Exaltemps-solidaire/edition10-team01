#!/usr/bin/env bash
# Outil : vérifie le contrat de déployabilité (docs/contrat-deployabilite.md).
# Deux niveaux, pour illustrer panneau, alarme, borne :
#   BORNE  : un .env ou un secret dans le code déployé, ou la passation copiée dans un service. Code de sortie 1.
#            Les contrôles portent sur les fichiers présents sur le disque : le déploiement ne passe pas par git.
#            Le hook verifier-avant-signal.sh refuse alors le signal à PM Lab.
#   ALARME : un élément du contrat manque. Signalé, sans bloquer.
# Usage : scripts/verifier-deployabilite.sh [--construire]
#   --construire : reconstruit et démarre l'application avec Docker, si Docker est disponible.
set -uo pipefail
bornes=0
borne()  { echo "BORNE  : $1" >&2; bornes=$((bornes + 1)); }
alarme() { echo "ALARME : $1"; }

# Bornes : rien de secret ni de personnel dans ce qui est construit et déployé.
# api/ et frontend/ sont les contextes de construction des images : tout ce qu'ils contiennent peut finir en ligne.
exclus=(-path '*/node_modules' -o -path '*/.next' -o -path '*/out')
for f in $(find api frontend \( "${exclus[@]}" \) -prune -o -type f -name '.env*' ! -name '.env.example' -print 2>/dev/null); do
  borne "$f est dans un service déployé : sors-le du dossier et considère ses secrets comme compromis"
done
# Les .env locaux (hors services) et la passation sont légitimes sur la VM : ils ne sont pas analysés.
if grep -rIlE 'sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY' . \
     --exclude-dir={node_modules,.next,out,.git,passation,.iterations} \
     --exclude='.env*' --exclude=verifier-deployabilite.sh >/dev/null 2>&1; then
  borne "secret probable dans le code : grep -rnIE 'sk-|AKIA|PRIVATE KEY' --exclude-dir=node_modules . pour le voir"
fi
if find api frontend \( "${exclus[@]}" \) -prune -o \( -iname '*passation*' -o -iname '*.pdf' \) -print 2>/dev/null | grep -q .; then
  borne "un document de la passation (ou un PDF) est copié dans api/ ou frontend/ (documents de l'association)"
fi

# Alarmes : le contrat, élément par élément
# Structure imposée par le gabarit du serveur : deux services, api/ et frontend/ (voir docs/guidelines-deploiement.md).
# Règle 1 : un compose à la racine (posé par la recette du serveur), ou les deux Dockerfile du gabarit.
if [ ! -f podman-compose.yml ] && [ ! -f docker-compose.yml ] && [ ! -f compose.yaml ]; then
  for s in api frontend; do
    [ -f "$s/Dockerfile" ] || alarme "pas de $s/Dockerfile (règle 1, gabarit du serveur)"
  done
fi
[ -f .env.example ] || alarme "pas de .env.example (règle 2)"
[ -f DEPLOIEMENT.md ] || alarme "pas de DEPLOIEMENT.md (règle 8)"
# Règle 5 : /health et /sante dans chacun des deux services. Le front est statique (fichiers dans public/) ;
# côté API, la route est une chaîne dans le code, hors tests.
for r in health sante; do
  [ -f "frontend/public/$r" ] || alarme "pas de frontend/public/$r : le front doit répondre sur /$r (règle 5)"
  grep -rqE "[\"'\`]/${r}[\"'\`]" --include='*.ts' --exclude='*.test.ts' api/src 2>/dev/null \
    || alarme "pas de route /$r dans api/src (règle 5)"
done

# Préconisation : construire avec Docker, seulement s'il est disponible
if [ "${1:-}" = "--construire" ]; then
  if command -v docker >/dev/null 2>&1; then
    docker compose up --build -d && echo "Construit et démarré avec Docker." || alarme "docker compose up --build échoue (règle 1)"
  else
    echo "Docker n'est pas disponible sur cette machine : construction Docker non vérifiée (préconisation)."
  fi
fi

if [ "$bornes" -gt 0 ]; then
  echo "Contrat de déployabilité : $bornes borne(s) franchie(s). À corriger avant de signaler la version." >&2
  exit 1
fi
echo "Contrat de déployabilité : aucune borne franchie."
