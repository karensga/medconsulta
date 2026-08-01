"use client";

import { useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";
import { connectGoogle } from "@/app/actions/google";

export default function ConnectGoogleButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const toastId = toast.loading("Conectando con Google Calendar...");
    startTransition(async () => {
      try {
        // En éxito, la action redirige de página completa a Google (no hay
        // vuelta atrás en este mismo render), así que el toast de "cargando"
        // desaparece solo con la navegación.
        await connectGoogle();
      } catch (e: unknown) {
        // connectGoogle() termina en redirect(url) hacia Google en éxito, lo
        // que lanza un error interno de Next (NEXT_REDIRECT): no es un error
        // real, hay que dejarlo pasar.
        unstable_rethrow(e);
        toast.dismiss(toastId);
        toast.error(
          e instanceof Error ? e.message : "No se pudo iniciar la conexión con Google."
        );
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Conectando..." : "Conectar Google Calendar"}
    </button>
  );
}
