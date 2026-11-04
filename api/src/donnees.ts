// Génère le schéma et charge le jeu de test à partir du modèle de données imposé
// (donnees/modele_donnees.json, donnees/csv/*.csv). Idempotent : ne rejoue rien si
// la table `projet` existe déjà.
//
// Simplification assumée pour tenir le budget : pas de contrainte de clé étrangère
// (les colonnes "→ Entité" restent de simples uuid), et les attributs "tags (multi)"
// stockent les libellés en texte plutôt que de résoudre les id de `tag`.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";

const ICI = dirname(fileURLToPath(import.meta.url));
const DONNEES_DIR = join(ICI, "..", "data");

type Attr = { n: string; t: string; f?: string; valeurs?: string[] };
type Entite = { key: string; attrs: Attr[] };
type Modele = { entites: Entite[] };

const ORDRE_CHARGEMENT = [
  "tag", "membre", "programme", "institution", "contact",
  "projet", "financement", "equipe_projet", "classe", "fichier_projet",
  "inscription", "modele", "seance", "participation", "changement",
  "evenement_agenda", "message", "questionnaire", "rapport",
];

function colonneSQL(attr: Attr): string {
  const nom = `"${attr.n}"`;
  if (attr.t === "UUID v7" || attr.t.startsWith("→")) return `${nom} uuid`;
  if (attr.t === "entier") return `${nom} integer`;
  if (attr.t === "booléen") return `${nom} boolean`;
  if (attr.t === "date") return `${nom} date`;
  if (attr.t === "date-heure") return `${nom} timestamp`;
  if (attr.t === "structure") return `${nom} jsonb`;
  if (attr.t === "tags (multi)" || attr.t.startsWith("liste →")) return `${nom} text[]`;
  return `${nom} text`; // texte, fichier, énumération (valeur unique)
}

function parseCSV(texte: string): string[][] {
  const lignes: string[][] = [];
  let ligne: string[] = [];
  let champ = "";
  let dansGuillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (dansGuillemets) {
      if (c === '"' && texte[i + 1] === '"') {
        champ += '"';
        i++;
      } else if (c === '"') {
        dansGuillemets = false;
      } else {
        champ += c;
      }
    } else if (c === '"') {
      dansGuillemets = true;
    } else if (c === ",") {
      ligne.push(champ);
      champ = "";
    } else if (c === "\n") {
      ligne.push(champ);
      lignes.push(ligne);
      ligne = [];
      champ = "";
    } else if (c !== "\r") {
      champ += c;
    }
  }
  if (champ.length > 0 || ligne.length > 0) {
    ligne.push(champ);
    lignes.push(ligne);
  }
  return lignes.filter((l) => l.length > 1 || l[0] !== "");
}

function valeurTypee(attr: Attr, brut: string): unknown {
  if (brut === "") return null;
  if (attr.t === "entier") {
    const n = Number.parseInt(brut, 10);
    return Number.isNaN(n) ? null : n; // des cellules du jeu de test contiennent du texte à la place d'un entier, gardé tel quel en amont : non corrigé, donc NULL plutôt qu'un crash du chargement
  }
  if (attr.t === "booléen") return brut.toLowerCase() === "true";
  if (attr.t === "tags (multi)" || attr.t.startsWith("liste →")) {
    return brut.split("|").map((s) => s.trim()).filter(Boolean);
  }
  return brut;
}

export async function initialiserDonnees(pool: Pool): Promise<void> {
  const { rows } = await pool.query<{ existe: boolean }>(
    `select exists (select 1 from information_schema.tables where table_name = 'projet') as existe`,
  );
  if (rows[0]?.existe) return;

  const modele = JSON.parse(readFileSync(join(DONNEES_DIR, "modele_donnees.json"), "utf8")) as Modele;
  const entitesParCle = new Map(modele.entites.map((e) => [e.key, e]));

  // Transaction : si le chargement échoue, aucune table ne reste créée, et la
  // vérification ci-dessus retentera une initialisation complète au prochain démarrage.
  const client = await pool.connect();
  try {
    await client.query("begin");

    for (const cle of ORDRE_CHARGEMENT) {
      const entite = entitesParCle.get(cle);
      if (!entite) continue;
      const colonnes = entite.attrs.map(colonneSQL).join(", ");
      const pk = entite.attrs.find((a) => a.f?.includes("pk"))?.n ?? "id";
      await client.query(`create table "${cle}" (${colonnes}, primary key ("${pk}"))`);
    }

    for (const cle of ORDRE_CHARGEMENT) {
      const entite = entitesParCle.get(cle);
      if (!entite) continue;
      const texte = readFileSync(join(DONNEES_DIR, "csv", `${cle}.csv`), "utf8");
      const [entetes, ...lignes] = parseCSV(texte);
      const attrsParNom = new Map(entite.attrs.map((a) => [a.n, a]));
      const colonnesInsert = entetes.map((n) => `"${n}"`).join(", ");
      const placeholders = entetes.map((_, i) => `$${i + 1}`).join(", ");
      for (const [index, ligne] of lignes.entries()) {
        const valeurs = entetes.map((nom, i) => valeurTypee(attrsParNom.get(nom)!, ligne[i] ?? ""));
        try {
          await client.query(`insert into "${cle}" (${colonnesInsert}) values (${placeholders})`, valeurs);
        } catch (erreur) {
          throw new Error(`chargement de "${cle}", ligne ${index + 2} : ${(erreur as Error).message}`);
        }
      }
    }

    await client.query("commit");
  } catch (erreur) {
    await client.query("rollback");
    throw erreur;
  } finally {
    client.release();
  }
}
