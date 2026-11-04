"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import QuiEtesVous from "./QuiEtesVous";
import EcranSeances from "./EcranSeances";
import EcranRapport from "./EcranRapport";
import type { Membre, Projet } from "./types";

const CLE_STOCKAGE = "membre-courant";
type Ecran = "seances" | "rapport";

function lireMembreStocke(): Membre | null {
  if (typeof window === "undefined") return null;
  const brut = window.localStorage.getItem(CLE_STOCKAGE);
  if (!brut) return null;
  try {
    return JSON.parse(brut) as Membre;
  } catch {
    window.localStorage.removeItem(CLE_STOCKAGE);
    return null;
  }
}

export default function Home() {
  const [membre, setMembre] = useState<Membre | null>(lireMembreStocke);
  const [ecran, setEcran] = useState<Ecran>("seances");
  const [projets, setProjets] = useState<Projet[]>([]);
  const [projetId, setProjetId] = useState("");

  useEffect(() => {
    fetch("/api/v1/projets")
      .then((r) => r.json())
      .then((data: Projet[]) => {
        setProjets(data);
        setProjetId((courant) => courant || data[0]?.id || "");
      })
      .catch(() => setProjets([]));
  }, []);

  function choisirMembre(m: Membre) {
    setMembre(m);
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(m));
  }

  function changerDeMembre() {
    setMembre(null);
    window.localStorage.removeItem(CLE_STOCKAGE);
  }

  if (!membre) {
    return (
      <div className={styles.page}>
        <header className={styles.entete}>
          <div>
            <h1>Méditerranée 2000</h1>
            <p>Suivi des projets d&apos;éducation à l&apos;environnement</p>
          </div>
        </header>
        <QuiEtesVous onChoisir={choisirMembre} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.entete}>
        <div>
          <h1>Méditerranée 2000</h1>
          <p>Suivi des projets d&apos;éducation à l&apos;environnement</p>
        </div>
        <nav className={styles.nav}>
          <button
            className={ecran === "seances" ? styles.navBtnActif : styles.navBtn}
            onClick={() => setEcran("seances")}
          >
            Séances
          </button>
          <button
            className={ecran === "rapport" ? styles.navBtnActif : styles.navBtn}
            onClick={() => setEcran("rapport")}
          >
            Rapport de bilan
          </button>
        </nav>
        <div className={styles.identite}>
          <span className={styles.identiteBadge}>
            {membre.prenom} {membre.nom} · {membre.profil}
          </span>
          <button className={styles.lienDiscret} onClick={changerDeMembre}>
            Changer
          </button>
        </div>
      </header>

      {ecran === "seances" ? (
        <EcranSeances membre={membre} projets={projets} projetId={projetId} onChangerProjet={setProjetId} />
      ) : (
        <EcranRapport membre={membre} projets={projets} projetId={projetId} onChangerProjet={setProjetId} />
      )}
    </div>
  );
}
