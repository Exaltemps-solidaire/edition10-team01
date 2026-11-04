import type { NextConfig } from "next";

// Gabarit du serveur : le front est un site statique servi par nginx (port 80 du conteneur, 8080 sur la VM).
// Pas de serveur Node côté front : les données passent par l'API, en chemin relatif (/api/...).
const nextConfig: NextConfig = {
  output: "export",
  // L'optimisation d'image par défaut exige un serveur Node, absent d'un export statique.
  images: { unoptimized: true },
};

export default nextConfig;
