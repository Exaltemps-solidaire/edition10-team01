---
description: Télécharge le dossier de passation de l'équipe et le résume
argument-hint: <CODE de l'équipe>
---
Récupère la passation de l'équipe `$ARGUMENTS`.

1. Si `$ARGUMENTS` est vide, ou si la variable d'environnement `CLE` n'est pas définie, arrête-toi et demande ce qui manque (❓). N'écris jamais la clé dans un fichier.
2. Lis [docs/passation.md](../../docs/passation.md).
3. Télécharge et dézippe avec l'outil du harnais : `./scripts/recuperer-passation.sh $ARGUMENTS`. N'appelle pas `curl` toi-même. En cas d'échec, rapporte le message du script (403 : clé, 404 : code d'équipe), sans réessayer en boucle.
4. Vérifie que `passation/` figure dans `.gitignore`.
5. Lis `passation/PASSATION.md`, puis les fichiers marqués comme essentiels dans la carte.
6. Rends un résumé de 10 lignes au plus : l'association, la problématique retenue, les écrans de la solution, la présence ou non du prototype, les hypothèses, ce qui a été écarté, et les étapes « Pas encore produit ».
7. Vérifie la Definition of Ready du hackathon (section 3 de `CLAUDE.md`) et dis, point par point, si elle est remplie. Si elle l'est, propose `/planifier-iterations`. Sinon, dis ce qui manque et qui peut le lever (les cadreurs pour la problématique ou la solution, l'équipe plateforme pour les variables). Ne code rien.
