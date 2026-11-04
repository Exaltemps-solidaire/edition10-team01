// Routage de l'API. Le proxy d'entrée envoie /api/... à ce service sans retirer le préfixe :
// les routes métier se déclarent donc sous /api/v1/... ; /health et /sante restent à la racine.
import { pool } from "./db.ts";

export type Reponse = { statut: number; corps?: unknown };

export async function router(methode: string, url: string): Promise<Reponse> {
  const { pathname } = new URL(url, "http://api");

  if (methode === "GET" && (pathname === "/health" || pathname === "/sante")) {
    return { statut: 200, corps: { status: "ok" } };
  }

  if (methode === "GET" && pathname === "/api/v1/projets") {
    const { rows } = await pool.query(
      `select "id", "nom", "annee_scolaire", "statut" from "projet" order by "nom"`,
    );
    return { statut: 200, corps: rows };
  }

  const matchSeances = pathname.match(/^\/api\/v1\/projets\/([^/]+)\/seances$/);
  if (methode === "GET" && matchSeances) {
    const { rows } = await pool.query(
      `select
         s."id", s."numero", s."debut", s."statut", s."effectif_reel",
         i."nom" as institution_nom,
         c."effectif_declare",
         (q."repondu_le" is not null) as retour_recu
       from "seance" s
       join "inscription" ins on ins."id" = s."inscription_id"
       join "classe" c on c."id" = ins."classe_id"
       join "institution" i on i."id" = c."institution_id"
       left join "questionnaire" q on q."inscription_id" = ins."id"
       where ins."projet_id" = $1
       order by s."debut"`,
      [matchSeances[1]],
    );
    return { statut: 200, corps: rows };
  }

  return { statut: 404 };
}
