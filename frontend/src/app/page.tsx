"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Projet = { id: string; nom: string; annee_scolaire: string; statut: string };
type Seance = {
  id: string;
  numero: number;
  debut: string;
  statut: string;
  effectif_reel: number | null;
  institution_nom: string;
  effectif_declare: number | null;
  retour_recu: boolean;
};

export default function Home() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [projetId, setProjetId] = useState<string>("");
  const [seances, setSeances] = useState<Seance[]>([]);

  useEffect(() => {
    fetch("/api/v1/projets")
      .then((r) => r.json())
      .then((data: Projet[]) => {
        setProjets(data);
        if (data[0]) setProjetId(data[0].id);
      })
      .catch(() => setProjets([]));
  }, []);

  useEffect(() => {
    if (!projetId) return;
    fetch(`/api/v1/projets/${projetId}/seances`)
      .then((r) => r.json())
      .then((data: Seance[]) => setSeances(data))
      .catch(() => setSeances([]));
  }, [projetId]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Suivi des séances par projet</h1>
        <p>Méditerranée 2000 — données de séance et retours d&apos;expérience, rassemblés par projet.</p>

        <label htmlFor="projet">Projet</label>
        <select id="projet" value={projetId} onChange={(e) => setProjetId(e.target.value)}>
          {projets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} ({p.annee_scolaire}) — {p.statut}
            </option>
          ))}
        </select>

        <table>
          <thead>
            <tr>
              <th>Séance</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Institution bénéficiaire</th>
              <th>Effectif (déclaré / réel)</th>
              <th>Retour d&apos;expérience</th>
            </tr>
          </thead>
          <tbody>
            {seances.map((s) => (
              <tr key={s.id}>
                <td>Séance {s.numero}</td>
                <td>{s.debut}</td>
                <td>{s.statut}</td>
                <td>{s.institution_nom}</td>
                <td>
                  {s.effectif_declare ?? "—"} / {s.effectif_reel ?? "—"}
                </td>
                <td>{s.retour_recu ? "Reçu" : "En attente"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
