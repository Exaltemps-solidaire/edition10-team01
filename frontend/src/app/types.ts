export type Membre = {
  id: string;
  prenom: string;
  nom: string;
  profil: string;
  roles: { projetId: string; roles: string[] }[];
};

export type Projet = { id: string; nom: string; annee_scolaire: string; statut: string };

export type Seance = {
  id: string;
  numero: number;
  debut: string;
  statut: string;
  effectif_reel: number | null;
  institution_nom: string;
  effectif_declare: number | null;
  animatrice_id: string | null;
  repondu_le: string | null;
  reponses: { reactions: string[]; frein: string; temoignage: string } | null;
  satisfaction: number | null;
  questionnaire_envoye_le: string | null;
  relance_envoyee_le: string | null;
};

export type Financement = { id: string; institution_nom: string };

export type Rapport = {
  financement: { id: string; institutionNom: string; perimetre: string[] };
  perimetrePartielNonResolu: boolean;
  nombreSeances: number;
  nombreSeancesRealisees: number;
  nombreRetoursRecus: number;
  tauxReponse: number;
  seances: Seance[];
};

export function rolesSurProjet(membre: Membre, projetId: string): string[] {
  return membre.roles.find((r) => r.projetId === projetId)?.roles ?? [];
}

export function peutAgirSurSeance(membre: Membre, projetId: string, seance: Seance): boolean {
  if (membre.profil === "admin") return true;
  const roles = rolesSurProjet(membre, projetId);
  if (roles.includes("coordinatrice")) return true;
  if (roles.includes("animatrice") && seance.animatrice_id === membre.id) return true;
  return false;
}

export function peutVoirRapport(membre: Membre, projetId: string): boolean {
  if (membre.profil === "admin") return true;
  return rolesSurProjet(membre, projetId).includes("coordinatrice");
}
