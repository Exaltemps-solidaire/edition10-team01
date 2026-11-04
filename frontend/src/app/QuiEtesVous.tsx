"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import type { Membre } from "./types";

export default function QuiEtesVous({ onChoisir }: { onChoisir: (membre: Membre) => void }) {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    fetch("/api/v1/membres")
      .then((r) => r.json())
      .then((data: Membre[]) => setMembres(data))
      .catch(() => setErreur(true));
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.titre}>Qui êtes-vous ?</div>
      <p className={styles.sousTitre}>
        Choisissez votre profil pour accéder au suivi des projets. Vos droits (admin, coordinatrice,
        animatrice) déterminent ce que vous pouvez consulter et modifier.
      </p>

      {erreur && <div className={styles.erreur}>Impossible de charger la liste des membres.</div>}

      <div className={styles.cartesIdentite}>
        {membres.map((m) => (
          <button key={m.id} className={styles.carteIdentite} onClick={() => onChoisir(m)}>
            <div className={styles.carteIdentiteNom}>
              {m.prenom} {m.nom}
            </div>
            <div className={styles.carteIdentiteProfil}>{m.profil}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
