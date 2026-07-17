"use client";

import { useState, useTransition } from "react";
import ConfirmModal from "@/app/ui/ConfirmModal";

interface Props {
  action: (formData: FormData) => Promise<void>;
  label?: string;
  confirmMessage?: string;
}

export default function DeleteButton({
  action,
  label = "Eliminar",
  confirmMessage = "Esta acción no se puede deshacer.",
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await action(new FormData());
      setOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
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
      />
    </>
  );
}
