"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEV_PORTAL_COOKIE } from "@/lib/devPortal";

// Selecciona (o limpia) el paciente impersonado en el modo bypass del portal.
export const selectDevPortalPaciente = async (formData: FormData) => {
  const pacienteId = (formData.get("pacienteId") as string) || "";
  const store = await cookies();
  if (pacienteId) {
    store.set(DEV_PORTAL_COOKIE, pacienteId, { httpOnly: true, sameSite: "lax", path: "/" });
    redirect("/portal/mi-perfil");
  } else {
    store.delete(DEV_PORTAL_COOKIE);
    redirect("/portal");
  }
};
