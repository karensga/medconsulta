import { cookies } from "next/headers";

// Cookie que guarda qué paciente estamos "impersonando" en el modo bypass del
// portal (mientras Auth0 de usuarios se organiza). NO usar en producción real:
// el portal definitivo resuelve el paciente desde el token, nunca de una cookie.
export const DEV_PORTAL_COOKIE = "dev_portal_paciente";

export const getDevPortalPacienteId = async (): Promise<string | null> => {
  const store = await cookies();
  return store.get(DEV_PORTAL_COOKIE)?.value ?? null;
};
