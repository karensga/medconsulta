"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  "doctor-created": "Doctor registrado correctamente",
  "doctor-deleted": "Doctor eliminado",
  "patient-created": "Paciente registrado correctamente",
  "patient-deleted": "Paciente eliminado",
  "appointment-created": "Cita creada exitosamente",
  "appointment-deleted": "Cita eliminada",
  "appointment-rescheduled": "Cita reagendada",
};

export default function ToastTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const msg = searchParams.get("msg");
    if (!msg || !MESSAGES[msg]) return;
    toast.success(MESSAGES[msg]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("msg");
    const newUrl = params.size ? `${pathname}?${params}` : pathname;
    router.replace(newUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
