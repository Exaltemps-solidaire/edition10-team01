#!/usr/bin/env bash
# Vérification (borne) : on ne signale pas une version à PM Lab si elle n'est pas finie.
# « Finie » = contrat de déployabilité sans borne franchie (aucun .env ni secret suivi)
# et tests verts. La mise en ligne n'est pas vérifiée ici : le développeur la confirme.
# Un code de sortie 2 bloque la commande et renvoie le message à l'agent.

# Sans jq, la commande ne peut pas être lue : on refuse tout plutôt que de laisser passer le signal.
command -v jq >/dev/null 2>&1 || { echo "Harnais : jq est introuvable, la commande ne peut pas être vérifiée. Installe jq." >&2; exit 2; }
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 2

cmd=$(jq -r '.tool_input.command // ""')
# Seuls le script de signal et un curl direct vers version-prete déclenchent le contrôle.
motif='signaler-version|curl[^;&|]*version-prete'
[[ "$cmd" =~ $motif ]] || exit 0

# Un refus est tracé ici : refusée, l'action n'atteint jamais le traceur PostToolUse.
refuser() {
  echo "$1" >&2
  mkdir -p .iterations
  jq -nc --arg c "$cmd" --arg m "$1" '{t: (now | todate), evenement: "refus", cible: $c, message: $m}' >> .iterations/trace.jsonl
  exit 2
}

if ! sortie=$(./scripts/verifier-deployabilite.sh 2>&1); then
  refuser "Signal refusé par le harnais : le contrat de déployabilité n'est pas respecté.
$(echo "$sortie" | grep '^BORNE')"
fi
if ! npm test --silent >/dev/null 2>&1; then
  refuser "Signal refusé par le harnais : npm test échoue. Corrige les tests avant de signaler la version."
fi
exit 0
