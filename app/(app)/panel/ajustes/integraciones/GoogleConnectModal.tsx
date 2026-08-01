"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarCheck2, X } from "lucide-react";

export default function GoogleConnectModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Leer window.location directamente evita depender de useSearchParams,
    // que puede causar re-renders del router de Next.js y resetear el estado.
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "conectado") {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    // Limpiar el param solo al cerrar, cuando ya no importa si Next.js re-renderiza.
    const url = new URL(window.location.href);
    url.searchParams.delete("google");
    window.history.replaceState(null, "", url.toString());
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl p-8 w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-300 ease-[var(--ease-out)] fill-mode-both">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ícono */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 animate-in zoom-in-95 duration-300 delay-150 fill-mode-both ease-[var(--ease-out)]">
          <CalendarCheck2 className="w-8 h-8 text-green-600" />
        </div>

        {/* Texto */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-both ease-[var(--ease-out)]">
          <h2 className="text-xl font-bold text-gray-900">
            ¡Google Calendar conectado!
          </h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            A partir de ahora, cada cita que se agende creará un evento en el
            calendario del consultorio. Las citas virtuales incluirán el enlace
            de Google Meet automáticamente.
          </p>
        </div>

        {/* Acción */}
        <button
          onClick={handleClose}
          className="mt-6 w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-[background-color,transform] duration-150 active:scale-[0.97] animate-in fade-in duration-300 delay-300 fill-mode-both"
        >
          Entendido
        </button>
      </div>
    </div>,
    document.body
  );
}
