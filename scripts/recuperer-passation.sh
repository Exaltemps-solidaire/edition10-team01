#!/usr/bin/env bash
# Outil : télécharge et dézippe la passation de l'équipe dans passation/.
# Usage : scripts/recuperer-passation.sh <CODE>   (la clé est lue dans $CLE)
set -euo pipefail
code="${1:-}"
[[ "$code" =~ ^[A-Za-z0-9]{6}$ ]] || { echo "Code d'équipe invalide : six lettres ou chiffres attendus." >&2; exit 1; }
[ -n "${CLE:-}" ] || { echo "Variable CLE absente." >&2; exit 1; }
statut=$(curl -sS -o passation.zip -w '%{http_code}' -H "x-cle-contexte: $CLE" \
  "https://pmlab-solidaire.exalt-lab.com/be/equipes/$code/passation.zip")
case "$statut" in
  200) ;;
  403) rm -f passation.zip; echo "403 : clé absente ou fausse." >&2; exit 1 ;;
  404) rm -f passation.zip; echo "404 : code d'équipe inconnu." >&2; exit 1 ;;
  *)   rm -f passation.zip; echo "Erreur HTTP $statut." >&2; exit 1 ;;
esac
rm -rf passation && unzip -q passation.zip -d passation && rm passation.zip
echo "$code" > passation/.code-equipe
echo "Passation de $code dans passation/."
