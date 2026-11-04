#!/usr/bin/env bash
# Outil : signale à PM Lab qu'une version est en ligne. Seule écriture vers PM Lab.
# Usage : scripts/signaler-version.sh <N>   (code d'équipe lu dans passation/.code-equipe)
# Le hook verifier-avant-signal.sh refuse cet appel si les tests ou /sante échouent.
set -euo pipefail
numero="${1:-}"
[[ "$numero" =~ ^[0-9]{1,2}$ ]] || { echo "Numéro d'itération invalide." >&2; exit 1; }
code=$(cat passation/.code-equipe 2>/dev/null) || { echo "Code d'équipe introuvable : lance d'abord /recuperer-passation." >&2; exit 1; }
[ -n "${CLE:-}" ] && [ -n "${URL_PUBLIQUE:-}" ] || { echo "Variables CLE ou URL_PUBLIQUE absentes." >&2; exit 1; }
curl -fsS -X POST -H "x-cle-contexte: $CLE" -H "content-type: application/json" \
  -d "{\"numero\": $numero, \"url\": \"$URL_PUBLIQUE\"}" \
  "https://pmlab-solidaire.exalt-lab.com/be/equipes/$code/version-prete"
echo
