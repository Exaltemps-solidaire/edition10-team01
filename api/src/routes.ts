// Routage de l'API. Le proxy d'entrée envoie /api/... à ce service sans retirer le préfixe :
// les routes métier se déclarent donc sous /api/v1/... ; /health et /sante restent à la racine.
import { randomUUID } from "node:crypto";
import { pool } from "./db.ts";
import { peutAgirSurSeance, peutVoirRapport } from "./droits.ts";

export type Reponse = { statut: number; corps?: unknown };

async function relancerQuestionnairesEnRetard(projetId: string): Promise<void> {
  const { rows: aRelancer } = await pool.query(
    `select s."id" as seance_id, c."enseignant_id" as destinataire_id
     from "seance" s
     join "inscription" ins on ins."id" = s."inscription_id"
     join "classe" c on c."id" = ins."classe_id"
     join "message" m on m."seance_id" = s."id" and 'questionnaire' = any(m."type")
     left join "questionnaire" q on q."inscription_id" = ins."id"
     where ins."projet_id" = $1
       and q."repondu_le" is null
       and m."envoye_le" < now() - interval '7 days'
       and not exists (
         select 1 from "message" r where r."seance_id" = s."id" and 'rappel J-7' = any(r."type")
       )`,
    [projetId],
  );
  for (const ligne of aRelancer) {
    await pool.query(
      `insert into "message"
         ("id", "type", "seance_id", "destinataire_id", "expediteur", "copie_coordinatrice", "statut", "envoye_le")
       values ($1, $2, $3, $4, $5, $6, $7, now())`,
      [randomUUID(), ["rappel J-7"], ligne.seance_id, ligne.destinataire_id, ["adresse dédiée"], false, "envoyé"],
    );
  }
}

async function listerSeances(projetId: string) {
  await relancerQuestionnairesEnRetard(projetId);
  const { rows } = await pool.query(
    `select
       s."id", s."numero", s."debut", s."statut", s."effectif_reel",
       i."nom" as institution_nom,
       c."effectif_declare",
       ins."animatrice_id",
       q."repondu_le", q."reponses", q."satisfaction",
       envoi."envoye_le" as questionnaire_envoye_le,
       rappel."envoye_le" as relance_envoyee_le
     from "seance" s
     join "inscription" ins on ins."id" = s."inscription_id"
     join "classe" c on c."id" = ins."classe_id"
     join "institution" i on i."id" = c."institution_id"
     left join "questionnaire" q on q."inscription_id" = ins."id"
     left join lateral (
       select "envoye_le" from "message"
       where "seance_id" = s."id" and 'questionnaire' = any("type")
       order by "envoye_le" desc limit 1
     ) envoi on true
     left join lateral (
       select "envoye_le" from "message"
       where "seance_id" = s."id" and 'rappel J-7' = any("type")
       order by "envoye_le" desc limit 1
     ) rappel on true
     where ins."projet_id" = $1
     order by s."debut"`,
    [projetId],
  );
  return rows;
}

async function genererRapport(projetId: string, financementId: string) {
  const { rows: financementRows } = await pool.query(
    `select f."id", f."perimetre", i."nom" as institution_nom
     from "financement" f
     join "institution" i on i."id" = f."institution_id"
     where f."id" = $1 and f."projet_id" = $2`,
    [financementId, projetId],
  );
  const financement = financementRows[0];
  if (!financement) return null;

  const { rows: seances } = await pool.query(
    `select
       s."id", s."numero", s."debut", s."statut", s."effectif_reel",
       i."nom" as institution_nom,
       c."effectif_declare",
       q."repondu_le", q."reponses", q."satisfaction"
     from "seance" s
     join "inscription" ins on ins."id" = s."inscription_id"
     join "classe" c on c."id" = ins."classe_id"
     join "institution" i on i."id" = c."institution_id"
     left join "questionnaire" q on q."inscription_id" = ins."id"
     where ins."projet_id" = $1
     order by s."debut"`,
    [projetId],
  );

  const seancesRealisees = seances.filter((s) => s.statut === "réalisée");
  const retoursRecus = seances.filter((s) => s.repondu_le !== null);

  return {
    financement: { id: financement.id, institutionNom: financement.institution_nom, perimetre: financement.perimetre },
    perimetrePartielNonResolu: (financement.perimetre ?? []).includes("classes listées"),
    nombreSeances: seances.length,
    nombreSeancesRealisees: seancesRealisees.length,
    nombreRetoursRecus: retoursRecus.length,
    tauxReponse: seances.length > 0 ? Math.round((retoursRecus.length / seances.length) * 100) : 0,
    seances,
  };
}

function rapportEnHtml(rapport: NonNullable<Awaited<ReturnType<typeof genererRapport>>>, projetNom: string): string {
  const lignes = rapport.seances
    .map(
      (s: Record<string, unknown>) =>
        `<tr><td>Séance ${String(s.numero)}</td><td>${String(s.debut)}</td><td>${String(s.institution_nom)}</td><td>${String(s.effectif_declare ?? "—")}</td><td>${s.repondu_le ? "Reçu" : "En attente"}</td></tr>`,
    )
    .join("");
  return `<html><head><meta charset="utf-8"></head><body>
    <h1>Rapport de bilan — ${projetNom}</h1>
    <p>Institution financeuse : ${rapport.financement.institutionNom}</p>
    <p>${rapport.nombreSeancesRealisees} séance(s) réalisée(s) sur ${rapport.nombreSeances}, taux de retour des enseignants : ${rapport.tauxReponse}%.</p>
    <table border="1" cellpadding="4" cellspacing="0">
      <tr><th>Séance</th><th>Date</th><th>Institution</th><th>Effectif déclaré</th><th>Retour</th></tr>
      ${lignes}
    </table>
    <p><em>Analyse qualitative de la coordinatrice à compléter ici avant envoi.</em></p>
  </body></html>`;
}

export async function router(methode: string, url: string, corps?: unknown): Promise<Reponse> {
  const { pathname, searchParams } = new URL(url, "http://api");

  if (methode === "GET" && (pathname === "/health" || pathname === "/sante")) {
    return { statut: 200, corps: { status: "ok" } };
  }

  if (methode === "GET" && pathname === "/api/v1/membres") {
    const { rows } = await pool.query(
      `select m."id", m."prenom", m."nom", m."profil",
         coalesce(
           json_agg(json_build_object('projetId', ep."projet_id", 'roles', ep."roles")) filter (where ep."id" is not null),
           '[]'
         ) as roles
       from "membre" m
       left join "equipe_projet" ep on ep."membre_id" = m."id"
       group by m."id"
       order by m."prenom"`,
    );
    return { statut: 200, corps: rows };
  }

  if (methode === "GET" && pathname === "/api/v1/projets") {
    const { rows } = await pool.query(
      `select "id", "nom", "annee_scolaire", "statut" from "projet" order by "nom"`,
    );
    return { statut: 200, corps: rows };
  }

  const matchFinancements = pathname.match(/^\/api\/v1\/projets\/([^/]+)\/financements$/);
  if (methode === "GET" && matchFinancements) {
    const { rows } = await pool.query(
      `select f."id", i."nom" as institution_nom
       from "financement" f
       join "institution" i on i."id" = f."institution_id"
       where f."projet_id" = $1
       order by i."nom"`,
      [matchFinancements[1]],
    );
    return { statut: 200, corps: rows };
  }

  const matchSeances = pathname.match(/^\/api\/v1\/projets\/([^/]+)\/seances$/);
  if (methode === "GET" && matchSeances) {
    return { statut: 200, corps: await listerSeances(matchSeances[1]) };
  }

  const matchRapport = pathname.match(/^\/api\/v1\/projets\/([^/]+)\/rapport$/);
  if (methode === "GET" && matchRapport) {
    const financementId = searchParams.get("financementId");
    const membreId = searchParams.get("membreId");
    if (!financementId || !membreId) return { statut: 400, corps: { erreur: "financementId et membreId requis" } };
    if (!(await peutVoirRapport(membreId, matchRapport[1]))) return { statut: 403, corps: { erreur: "droits insuffisants" } };
    const rapport = await genererRapport(matchRapport[1], financementId);
    if (!rapport) return { statut: 404 };
    return { statut: 200, corps: rapport };
  }

  const matchRapportExport = pathname.match(/^\/api\/v1\/projets\/([^/]+)\/rapport\/export$/);
  if (methode === "GET" && matchRapportExport) {
    const financementId = searchParams.get("financementId");
    const membreId = searchParams.get("membreId");
    if (!financementId || !membreId) return { statut: 400, corps: { erreur: "financementId et membreId requis" } };
    if (!(await peutVoirRapport(membreId, matchRapportExport[1]))) return { statut: 403, corps: { erreur: "droits insuffisants" } };
    const rapport = await genererRapport(matchRapportExport[1], financementId);
    if (!rapport) return { statut: 404 };
    const { rows: projetRows } = await pool.query(`select "nom" from "projet" where "id" = $1`, [matchRapportExport[1]]);
    return {
      statut: 200,
      corps: { __export: "word", contenu: rapportEnHtml(rapport, projetRows[0]?.nom ?? "") },
    };
  }

  const matchEnvoyer = pathname.match(/^\/api\/v1\/seances\/([^/]+)\/questionnaire\/envoyer$/);
  if (methode === "POST" && matchEnvoyer) {
    const seanceId = matchEnvoyer[1];
    const { membreId } = (corps ?? {}) as { membreId?: string };
    if (!membreId) return { statut: 400, corps: { erreur: "membreId requis" } };
    if (!(await peutAgirSurSeance(membreId, seanceId))) return { statut: 403, corps: { erreur: "droits insuffisants" } };

    const { rows: deja } = await pool.query(
      `select 1 from "message" where "seance_id" = $1 and 'questionnaire' = any("type")`,
      [seanceId],
    );
    if (deja.length > 0) return { statut: 409, corps: { erreur: "questionnaire déjà envoyé pour cette séance" } };

    const { rows: cibleRows } = await pool.query(
      `select ins."id" as inscription_id, c."enseignant_id"
       from "seance" s
       join "inscription" ins on ins."id" = s."inscription_id"
       join "classe" c on c."id" = ins."classe_id"
       where s."id" = $1`,
      [seanceId],
    );
    const cible = cibleRows[0];
    if (!cible) return { statut: 404 };

    await pool.query(
      `insert into "message"
         ("id", "type", "seance_id", "destinataire_id", "expediteur", "copie_coordinatrice", "statut", "envoye_le")
       values ($1, $2, $3, $4, $5, $6, $7, now())`,
      [randomUUID(), ["questionnaire"], seanceId, cible.enseignant_id, ["adresse dédiée"], true, "envoyé"],
    );

    const { rows: existant } = await pool.query(
      `select "id" from "questionnaire" where "inscription_id" = $1`,
      [cible.inscription_id],
    );
    if (existant.length === 0) {
      await pool.query(
        `insert into "questionnaire" ("id", "inscription_id", "formulaire") values ($1, $2, $3)`,
        [randomUUID(), cible.inscription_id, "évaluation standard"],
      );
    }

    return { statut: 200, corps: { envoye: true } };
  }

  const matchRetour = pathname.match(/^\/api\/v1\/seances\/([^/]+)\/retour$/);
  if (methode === "POST" && matchRetour) {
    const seanceId = matchRetour[1];
    const { membreId, reactions, frein, temoignage, satisfaction } = (corps ?? {}) as {
      membreId?: string;
      reactions?: string[];
      frein?: string;
      temoignage?: string;
      satisfaction?: number;
    };
    if (!membreId) return { statut: 400, corps: { erreur: "membreId requis" } };
    if (!(await peutAgirSurSeance(membreId, seanceId))) return { statut: 403, corps: { erreur: "droits insuffisants" } };

    const { rows: cibleRows } = await pool.query(
      `select ins."id" as inscription_id
       from "seance" s
       join "inscription" ins on ins."id" = s."inscription_id"
       where s."id" = $1`,
      [seanceId],
    );
    const cible = cibleRows[0];
    if (!cible) return { statut: 404 };

    const reponses = { reactions: reactions ?? [], frein: frein ?? "", temoignage: temoignage ?? "" };

    const { rows: existant } = await pool.query(
      `select "id" from "questionnaire" where "inscription_id" = $1`,
      [cible.inscription_id],
    );
    if (existant.length === 0) {
      await pool.query(
        `insert into "questionnaire"
           ("id", "inscription_id", "formulaire", "repondu_le", "satisfaction", "reponses")
         values ($1, $2, $3, now(), $4, $5)`,
        [randomUUID(), cible.inscription_id, "évaluation standard", satisfaction ?? null, JSON.stringify(reponses)],
      );
    } else {
      await pool.query(
        `update "questionnaire"
         set "repondu_le" = now(), "satisfaction" = $2, "reponses" = $3
         where "id" = $1`,
        [existant[0].id, satisfaction ?? null, JSON.stringify(reponses)],
      );
    }

    await pool.query(
      `update "message" set "statut" = 'répondu' where "seance_id" = $1 and 'questionnaire' = any("type")`,
      [seanceId],
    );

    return { statut: 200, corps: { enregistre: true } };
  }

  return { statut: 404 };
}
