"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/app/ui/ConfirmModal";

interface Props {
  action: (formData: FormData) => Promise<void>;
  label?: string;
  confirmMessage?: string;
  loadingLabel?: string;
  buttonClassName?: string;
}

export default function DeleteButton({
  action,
  label = "Eliminar",
  confirmMessage = "Esta acción no se puede deshacer.",
  loadingLabel = "Eliminando...",
  buttonClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await action(new FormData());
        // Si la action redirige (caso normal en éxito), el navegador ya cambió
        // de página antes de llegar aquí. Si no, cerramos el modal igual.
        setOpen(false);
      } catch (e: unknown) {
        // La action termina en redirect() en éxito, lo que lanza un error
        // interno de Next (NEXT_REDIRECT): hay que dejarlo pasar, no es un
        // error real.
        unstable_rethrow(e);
        // No cerramos el modal para que la persona pueda reintentar.
        toast.error(e instanceof Error ? e.message : "No se pudo completar la acción.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={buttonClassName ?? "px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition active:scale-[0.97]"}
      >
        {label}
      </button>
      <ConfirmModal
        isOpen={open}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
        loading={isPending}
        confirmLabel={label}
        loadingLabel={loadingLabel}
      />
    </>
  );
}
