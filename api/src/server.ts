// Service api du gabarit : écoute sur PORT (8081 par défaut), journaux sur la sortie standard.
// Lancé directement par Node (suppression des types TypeScript), sans étape de compilation.
import { createServer } from "node:http";
import { pool } from "./db.ts";
import { initialiserDonnees } from "./donnees.ts";
import { router } from "./routes.ts";

const port = Number(process.env.PORT ?? 8081);

const serveur = createServer((req, res) => {
  router(req.method ?? "GET", req.url ?? "/")
    .then(({ statut, corps }) => {
      if (corps === undefined) {
        res.writeHead(statut).end();
      } else {
        res.writeHead(statut, { "Content-Type": "application/json" }).end(JSON.stringify(corps));
      }
    })
    .catch((erreur: unknown) => {
      console.error("api : erreur de requête", erreur);
      res.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ erreur: "erreur interne" }));
    });
});

initialiserDonnees(pool)
  .catch((erreur: unknown) => console.error("api : échec de l'initialisation des données", erreur))
  .finally(() => {
    serveur.listen(port, () => console.log(`api : à l'écoute sur le port ${port}`));
  });

// Arrêt propre : le conteneur reçoit SIGTERM, on termine les requêtes en cours avant de sortir.
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    console.log(`api : ${signal} reçu, arrêt`);
    serveur.close(() => process.exit(0));
  });
}
