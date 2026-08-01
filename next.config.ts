import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo aplica en desarrollo: imprime en la terminal los fetch que hace el
  // servidor (Server Actions / Server Components) — como apiFetch() en
  // lib/api/client.ts corre en el servidor, esas peticiones no aparecen en el
  // Network tab del navegador. Con esto se ven en la terminal donde corre
  // `next dev`, con URL completa incluida.
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
