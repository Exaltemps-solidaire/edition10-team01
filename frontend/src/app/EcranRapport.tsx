"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import type { Financement, Membre, Projet, Rapport } from "./types";
import { peutVoirRapport } from "./types";

export default function EcranRapport({
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
  const [financements, setFinancements] = useState<Financement[]>([]);
  const [financementId, setFinancementId] = useState("");
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const autorise = peutVoirRapport(membre, projetId);

  useEffect(() => {
    if (!projetId) return;
    fetch(`/api/v1/projets/${projetId}/financements`)
      .then((r) => r.json())
      .then((data: Financement[]) => {
        setFinancements(data);
        setFinancementId(data[0]?.id ?? "");
      })
      .catch(() => setFinancements([]));
  }, [projetId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setRapport(null);
      setErreur(null);
    });
    if (!projetId || !financementId || !autorise) return;
    fetch(`/api/v1/projets/${projetId}/rapport?financementId=${financementId}&membreId=${membre.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("rapport inaccessible");
        return r.json();
      })
      .then((data: Rapport) => setRapport(data))
      .catch(() => setErreur("Rapport inaccessible pour ce financement."));
  }, [projetId, financementId, membre.id, autorise]);

  if (!autorise) {
    return (
      <div className={styles.main}>
        <div className={styles.titre}>Rapport de bilan</div>
        <div className={styles.alerte}>
          Ce rapport est réservé à la coordinatrice du projet et à l&apos;administration.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.titre}>Rapport de bilan</div>
      <p className={styles.sousTitre}>
        Bilan cloisonné par institution financière : chaque financeur ne voit que les séances qui le
        concernent.
      </p>

      <div className={styles.carte}>
        <div className={styles.ligneOutils}>
          <div className={styles.champ}>
            <label htmlFor="projetRapport">Projet</label>
            <select
              id="projetRapport"
              className={styles.select}
              value={projetId}
              onChange={(e) => onChangerProjet(e.target.value)}
            >
              {projets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} ({p.annee_scolaire})
                </option>
              ))}
            </select>
          </div>
          <div className={styles.champ}>
            <label htmlFor="financement">Institution financière</label>
            <select
              id="financement"
              className={styles.select}
              value={financementId}
              onChange={(e) => setFinancementId(e.target.value)}
            >
              {financements.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.institution_nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {erreur && <div className={styles.erreur}>{erreur}</div>}

        {rapport && (
          <>
            {rapport.perimetrePartielNonResolu && (
              <div className={styles.alerte} style={{ marginBottom: 14 }}>
                ⚠️ Ce financement est limité à une liste de classes précise dans le modèle de données,
                mais aucune table ne relie un financement à ses classes. Le rapport ci-dessous porte donc
                sur l&apos;ensemble du projet, pas uniquement sur le périmètre financé — à vérifier avec
                l&apos;association avant tout envoi à ce financeur.
              </div>
            )}

            <div className={styles.statsGrille}>
              <div className={styles.stat}>
                <div className={styles.statNombre}>{rapport.nombreSeances}</div>
                <div className={styles.statLibelle}>Séances programmées</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNombre}>{rapport.nombreSeancesRealisees}</div>
                <div className={styles.statLibelle}>Séances réalisées</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNombre}>{rapport.nombreRetoursRecus}</div>
                <div className={styles.statLibelle}>Retours enseignants reçus</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNombre}>{rapport.tauxReponse}%</div>
                <div className={styles.statLibelle}>Taux de réponse</div>
              </div>
            </div>

            <div className={styles.actions} style={{ marginBottom: 14 }}>
              <a
                className={styles.btn}
                href={`/api/v1/projets/${projetId}/rapport/export?financementId=${financementId}&membreId=${membre.id}`}
              >
                Exporter (Word)
              </a>
              <button className={styles.btn} disabled title="Format imposé par le financeur non fourni dans la passation">
                Exporter (Écopousse)
              </button>
            </div>
            <div className={styles.alerte} style={{ marginBottom: 14 }}>
              ⚠️ L&apos;export « Écopousse » n&apos;est pas disponible : aucun gabarit ni ordre de colonnes
              imposé par ce financeur n&apos;a été fourni dans la passation. À demander à l&apos;association
              avant de le développer.
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Séance</th>
                    <th>Date</th>
                    <th>Institution</th>
                    <th>Effectif déclaré</th>
                    <th>Retour</th>
                  </tr>
                </thead>
                <tbody>
                  {rapport.seances.map((s) => (
                    <tr key={s.id}>
                      <td>Séance {s.numero}</td>
                      <td>{s.debut}</td>
                      <td>{s.institution_nom}</td>
                      <td>{s.effectif_declare ?? "—"}</td>
                      <td>{s.repondu_le ? "Reçu" : "En attente"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
