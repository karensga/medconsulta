"use server";

import { getGoogleConsentUrl, disconnectGoogle } from "@/lib/api/google";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Pide al back la URL de consentimiento y redirige el navegador a Google.
// La redirección de página completa es obligatoria (Google no permite iframes).
export const connectGoogle = async () => {
  const url = await getGoogleConsentUrl();
  redirect(url);
};

export const disconnectGoogleAction = async () => {
  await disconnectGoogle();
  revalidatePath("/panel/ajustes/integraciones");
  redirect("/panel/ajustes/integraciones?google=desconectado");
};
