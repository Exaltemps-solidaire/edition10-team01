#!/usr/bin/env bash
# Alarme du budget : à 8 minutes de codage, interrompt l'agent une seule fois par itération.
# Lit le chrono .iterations/<N>.debut ; se tait si .iterations/<N>.fin (codage terminé) ou .iterations/<N>.alarme existe.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
cat >/dev/null
debut=$(ls -t .iterations/*.debut 2>/dev/null | head -1)
[ -n "$debut" ] || exit 0
n=$(basename "$debut" .debut)
if [ -f ".iterations/$n.fin" ] || [ -f ".iterations/$n.alarme" ]; then exit 0; fi
minutes=$(( ($(date +%s) - $(cat "$debut")) / 60 ))
[ "$minutes" -ge 8 ] || exit 0
touch ".iterations/$n.alarme"
echo "Alarme du budget : itération $n, $minutes minutes de codage. Arrête-toi et demande au développeur : « On approche des 10 minutes. Tu préfères finaliser ce qui est en cours, ou t'arrêter là et publier ce qui marche ? »" >&2
exit 2
