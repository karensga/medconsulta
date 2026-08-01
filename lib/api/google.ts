import { apiFetch } from "@/lib/api/client";

// Integración de Google Calendar del consultorio (una conexión por tenant).
// Endpoints del back: GET /google/oauth/url, GET /google/estado,
// DELETE /google/integracion. El callback OAuth lo maneja el back y redirige
// al front (GOOGLE_OAUTH_SUCCESS_REDIRECT).

export type GoogleStatus = {
  conectado: boolean;
  calendarId?: string;
  actualizadoEl?: string; // ISO
};

export const getGoogleStatus = async (): Promise<GoogleStatus> =>
  apiFetch<GoogleStatus>("/google/estado");

// Devuelve la URL de consentimiento de Google. El front redirige el navegador
// completo a ella (Google no permite iframes/CORS en el consentimiento).
export const getGoogleConsentUrl = async (): Promise<string> => {
  const { url } = await apiFetch<{ url: string }>("/google/oauth/url");
  return url;
};

export const disconnectGoogle = async (): Promise<void> => {
  await apiFetch("/google/integracion", { method: "DELETE" });
};
