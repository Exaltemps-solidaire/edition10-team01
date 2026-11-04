# La passation : ce que contient `passation.zip`

L'archive est assemblée par PM Lab Solidaire au moment de l'appel : elle reflète l'état du cadrage de l'équipe à cet instant. Aucun modèle de langage ne la réécrit : c'est ce que l'équipe a produit, recopié et attribué. Un fichier qui contient « _Pas encore produit._ » signale une étape non faite, pas une erreur.

## Récupérer l'archive

Dans ce dépôt, l'agent passe par l'outil `./scripts/recuperer-passation.sh <CODE>`, qui fait l'appel ci-dessous et vérifie le code d'équipe. Pour mémoire :

```bash
curl -fsS -H "x-cle-contexte: $CLE" -o passation.zip \
  https://pmlab-solidaire.exalt-lab.com/be/equipes/<CODE>/passation.zip
```

- `<CODE>` : le code de l'équipe, six caractères. Sans le code : `GET /be/equipes` liste les équipes récentes.
- La clé se lit dans la variable `CLE`, jamais dans un fichier. Elle passe en en-tête, jamais dans l'URL.
- `403` : clé absente ou fausse. `404` : code inconnu.

## Ce que tu en fais, fichier par fichier

| Fichier | Ce que c'est | Rôle pour toi |
|---|---|---|
| `PASSATION.md` | Le dossier complet, en un seul fichier | **À lire en premier**, en entier |
| `cadrage/1-problematique.md` | La problématique retenue par l'équipe, et son « pourquoi » | Le cap : chaque itération doit y répondre |
| `cadrage/2-idees-priorisees.md` | Les familles d'idées, avec leurs points de vote | L'ordre de priorité : la famille retenue d'abord |
| `cadrage/3-solution.md` | La solution, écran par écran | **Le périmètre à construire**. Base du découpage en itérations |
| `cadrage/4-prototype.md` | Les versions du prototype, et celle qui est retenue | Indique si `prototype/index.html` existe |
| `prototype/index.html` | Le prototype HTML retenu par l'équipe | **La référence visuelle et fonctionnelle**. On le reproduit, on ne le réinvente pas |
| `croquis/ecran-NN-*.png` | Les photos des croquis, un par écran | Complément de `3-solution.md` quand le prototype est muet |
| `cadrage/5-hypotheses.md` | Les hypothèses que l'équipe veut vérifier, et ce qu'elle regardera | **Les critères d'acceptation**. Chaque itération en couvre au moins une |
| `contexte/association.md` | L'association et le thème | Contexte. Vocabulaire à reprendre dans l'interface |
| `matiere/ils-ont-dit.md` | Les notes prises pendant la rencontre avec l'association | Contexte. À relire en cas de doute sur un choix |
| `matiere/arbitrages.md` | Ce que l'équipe a écarté, et pourquoi | **Ce qu'il ne faut pas construire** |
| `documents-association/*` | Les documents fournis par l'association (PDF) | À ouvrir seulement si une règle métier y renvoie. **Peut contenir des données personnelles : ne jamais commiter, ne jamais copier dans le code** |
| `versions-non-retenues/` | Les autres versions du prototype | À ignorer, sauf demande explicite |
| `passation.json` | Le même contenu en JSON | Pour un traitement automatique. Ne pas le relire en entier |

## Signaler une version publiée

À la fin de chaque itération, une fois l'application en ligne, l'agent passe par l'outil `./scripts/signaler-version.sh <N>`, qui fait l'appel ci-dessous :

```bash
curl -fsS -X POST -H "x-cle-contexte: $CLE" -H "content-type: application/json" \
  -d '{"numero": <N>, "url": "<URL publique>"}' \
  https://pmlab-solidaire.exalt-lab.com/be/equipes/<CODE>/version-prete
```

C'est la seule route d'écriture sous cette clé. PM Lab enregistre la version et passe l'équipe aux tests. La réponse dit si le parcours a avancé (`moteur_avance`) : si ce n'est pas le cas, la version est quand même enregistrée.
