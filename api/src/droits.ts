// Droits du modèle imposé : l'admin a tous les droits, la coordinatrice tous ceux de
// son projet, l'animatrice seulement ses propres séances. Pas de connexion : le membre
// est celui choisi côté client, envoyé dans chaque requête d'écriture (membreId).
import { pool } from "./db.ts";

export async function peutAgirSurSeance(membreId: string, seanceId: string): Promise<boolean> {
  const { rows: membreRows } = await pool.query(
    `select "profil" from "membre" where "id" = $1`,
    [membreId],
  );
  const profil = membreRows[0]?.profil;
  if (!profil) return false;
  if (profil === "admin") return true;

  const { rows } = await pool.query(
    `select ins."projet_id", ins."animatrice_id"
     from "seance" s
     join "inscription" ins on ins."id" = s."inscription_id"
     where s."id" = $1`,
    [seanceId],
  );
  const seance = rows[0];
  if (!seance) return false;

  const { rows: epRows } = await pool.query(
    `select "roles" from "equipe_projet" where "membre_id" = $1 and "projet_id" = $2`,
    [membreId, seance.projet_id],
  );
  const roles: string[] = epRows[0]?.roles ?? [];
  if (roles.includes("coordinatrice")) return true;
  if (roles.includes("animatrice") && seance.animatrice_id === membreId) return true;
  return false;
}

export async function peutVoirRapport(membreId: string, projetId: string): Promise<boolean> {
  const { rows: membreRows } = await pool.query(
    `select "profil" from "membre" where "id" = $1`,
    [membreId],
  );
  if (membreRows[0]?.profil === "admin") return true;

  const { rows: epRows } = await pool.query(
    `select "roles" from "equipe_projet" where "membre_id" = $1 and "projet_id" = $2`,
    [membreId, projetId],
  );
  const roles: string[] = epRows[0]?.roles ?? [];
  return roles.includes("coordinatrice");
}
