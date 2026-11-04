"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import type { Membre, Projet, Seance } from "./types";
import { peutAgirSurSeance } from "./types";

const REACTIONS_POSSIBLES = ["Enthousiasme", "Curiosité", "Participation active", "Indifférence", "Réticence"];

function statutBadge(seance: Seance) {
  if (seance.repondu_le) return <span className={styles.badgeOk}>Retour reçu</span>;
  if (seance.relance_envoyee_le) return <span className={styles.badgeAlerte}>Relancé, sans retour</span>;
  if (seance.questionnaire_envoye_le) return <span className={styles.badgeAttente}>Questionnaire envoyé</span>;
  return <span className={styles.badgeAttente}>Questionnaire non envoyé</span>;
}

export default function EcranSeances({
  membre,
  projets,
  projetId,
  onChangerProjet,
}: {
  membre: Membre;
  projets: Projet[];
  projetId: string;
  onChangerProjet: (id: string) => void;
}) {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [seanceOuverte, setSeanceOuverte] = useState<string | null>(null);
  const [reactions, setReactions] = useState<string[]>([]);
  const [frein, setFrein] = useState("");
  const [temoignage, setTemoignage] = useState("");
  const [satisfaction, setSatisfaction] = useState(4);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "erreur"; texte: string } | null>(null);

  const chargerSeances = useCallback(() => {
    if (!projetId) return;
    fetch(`/api/v1/projets/${projetId}/seances`)
      .then((r) => r.json())
      .then((data: Seance[]) => setSeances(data))
      .catch(() => setSeances([]));
  }, [projetId]);

  useEffect(() => {
    chargerSeances();
  }, [chargerSeances]);

  async function envoyerQuestionnaire(seanceId: string) {
    setEnCours(seanceId);
    setMessage(null);
    try {
      const r = await fetch(`/api/v1/seances/${seanceId}/questionnaire/envoyer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membreId: membre.id }),
      });
      if (!r.ok) {
        const corps = await r.json().catch(() => ({}));
        setMessage({ type: "erreur", texte: corps.erreur ?? "Envoi impossible." });
      } else {
        setMessage({ type: "ok", texte: "Questionnaire envoyé à l'enseignant·e." });
        chargerSeances();
      }
    } finally {
      setEnCours(null);
    }
  }

  function ouvrirRetour(seance: Seance) {
    setSeanceOuverte(seance.id);
    setReactions(seance.reponses?.reactions ?? []);
    setFrein(seance.reponses?.frein ?? "");
    setTemoignage(seance.reponses?.temoignage ?? "");
    setSatisfaction(seance.satisfaction ?? 4);
    setMessage(null);
  }

  async function enregistrerRetour(seanceId: string) {
    setEnCours(seanceId);
    setMessage(null);
    try {
      const r = await fetch(`/api/v1/seances/${seanceId}/retour`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membreId: membre.id, reactions, frein, temoignage, satisfaction }),
      });
      if (!r.ok) {
        const corps = await r.json().catch(() => ({}));
        setMessage({ type: "erreur", texte: corps.erreur ?? "Enregistrement impossible." });
      } else {
        setMessage({ type: "ok", texte: "Retour d'expérience enregistré." });
        setSeanceOuverte(null);
        chargerSeances();
      }
    } finally {
      setEnCours(null);
    }
  }

  function basculerReaction(r: string) {
    setReactions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  return (
    <div className={styles.main}>
      <div className={styles.titre}>Centralisation des séances</div>
      <p className={styles.sousTitre}>
        Programmes et interventions de Méditerranée 2000 — une ligne par séance, questionnaire envoyé,
        relance à J+7 et retour d&apos;expérience de l&apos;enseignant·e.
      </p>

      <div className={styles.carte}>
        <div className={styles.ligneOutils}>
          <div className={styles.champ}>
            <label htmlFor="projet">Projet</label>
            <select
              id="projet"
              className={styles.select}
              value={projetId}
              onChange={(e) => onChangerProjet(e.target.value)}
            >
              {projets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} ({p.annee_scolaire}) — {p.statut}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && (
          <div className={message.type === "ok" ? styles.alerte : styles.erreur} style={{ marginBottom: 12 }}>
            {message.texte}
          </div>
        )}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Séance</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Institution</th>
                <th>Effectif (déclaré / réel)</th>
                <th>Questionnaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {seances.map((s) => {
                const autorise = peutAgirSurSeance(membre, projetId, s);
                return (
                  <Fragment key={s.id}>
                    <tr>
                      <td>Séance {s.numero}</td>
                      <td>{s.debut}</td>
                      <td>{s.statut}</td>
                      <td>{s.institution_nom}</td>
                      <td>
                        {s.effectif_declare ?? "—"} / {s.effectif_reel ?? "—"}
                      </td>
                      <td>{statutBadge(s)}</td>
                      <td>
                        <div className={styles.actions}>
                          {!s.questionnaire_envoye_le && (
                            <button
                              className={styles.btnSecondaire}
                              disabled={!autorise || enCours === s.id}
                              onClick={() => envoyerQuestionnaire(s.id)}
                              title={!autorise ? "Droits insuffisants pour cette séance" : undefined}
                            >
                              Envoyer le questionnaire
                            </button>
                          )}
                          {!s.repondu_le && (
                            <button
                              className={styles.btn}
                              disabled={!autorise}
                              onClick={() => ouvrirRetour(s)}
                              title={!autorise ? "Droits insuffisants pour cette séance" : undefined}
                            >
                              Enregistrer un retour
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {seanceOuverte === s.id && (
                      <tr>
                        <td colSpan={7}>
                          <div className={styles.carte} style={{ background: "var(--vert-clair)" }}>
                            <div className={styles.champ} style={{ marginBottom: 10 }}>
                              <label>Réactions observées</label>
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                {REACTIONS_POSSIBLES.map((r) => (
                                  <label key={r} className={styles.caseACocher}>
                                    <input
                                      type="checkbox"
                                      checked={reactions.includes(r)}
                                      onChange={() => basculerReaction(r)}
                                    />
                                    {r}
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className={styles.champ} style={{ marginBottom: 10 }}>
                              <label htmlFor="frein">Frein rencontré</label>
                              <textarea
                                id="frein"
                                className={styles.textarea}
                                value={frein}
                                onChange={(e) => setFrein(e.target.value)}
                              />
                            </div>
                            <div className={styles.champ} style={{ marginBottom: 10 }}>
                              <label htmlFor="temoignage">Témoignage</label>
                              <textarea
                                id="temoignage"
                                className={styles.textarea}
                                value={temoignage}
                                onChange={(e) => setTemoignage(e.target.value)}
                              />
                            </div>
                            <div className={styles.champ} style={{ marginBottom: 10 }}>
                              <label htmlFor="satisfaction">Satisfaction (1 à 5)</label>
                              <select
                                id="satisfaction"
                                className={styles.select}
                                value={satisfaction}
                                onChange={(e) => setSatisfaction(Number(e.target.value))}
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className={styles.piedForm}>
                              <button className={styles.btnSecondaire} onClick={() => setSeanceOuverte(null)}>
                                Annuler
                              </button>
                              <button
                                className={styles.btn}
                                disabled={enCours === s.id}
                                onClick={() => enregistrerRetour(s.id)}
                              >
                                Enregistrer
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {seances.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.sousTitre}>
                    Aucune séance pour ce projet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
