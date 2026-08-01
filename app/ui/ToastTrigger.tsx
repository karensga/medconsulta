"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  "especialista-created": "Especialista registrado correctamente",
  "especialista-updated": "Especialista actualizado correctamente",
  "especialista-deleted": "Especialista eliminado",
  "patient-created": "Paciente registrado correctamente",
  "patient-updated": "Paciente actualizado correctamente",
  "patient-deleted": "Paciente eliminado",
  "appointment-created": "Cita creada exitosamente",
  "appointment-deleted": "Cita eliminada",
  "appointment-rescheduled": "Cita reagendada",
};

// Estados del flujo de conexión con Google Calendar. "conectado" y "error" los
// pone el callback OAuth del backend (redirige a esta página con ?google=...);
// "desconectado" lo pone la propia action del front (app/actions/google.ts).
// "conectado" lo maneja GoogleConnectModal con un modal dedicado; aquí solo
// quedan los casos secundarios que sí van como toast.
const GOOGLE_MESSAGES: Record<string, { text: string; variant: "success" | "error" }> = {
  desconectado: { text: "Google Calendar desconectado", variant: "success" },
  error: {
    text: "Hubo un problema al conectar Google Calendar. Intenta de nuevo.",
    variant: "error",
  },
};

export default function ToastTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const msg = searchParams.get("msg");
    const google = searchParams.get("google");
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (msg && MESSAGES[msg]) {
      toast.success(MESSAGES[msg]);
      params.delete("msg");
      changed = true;
    }

    if (google && GOOGLE_MESSAGES[google]) {
      const { text, variant } = GOOGLE_MESSAGES[google];
      toast[variant](text);
      params.delete("google");
      changed = true;
    }

    if (changed) {
      const newUrl = params.size ? `${pathname}?${params}` : pathname;
      router.replace(newUrl);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
