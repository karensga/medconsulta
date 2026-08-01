"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { createEspecialista } from "@/app/actions/especialistas";
import SlotDurationSelect from "./SlotDurationSelect";

// Zona horaria detectada del navegador; el admin puede cambiarla. El back la
// exige para calcular jornada/slots y el evento de Google en la zona correcta.
const detectedTimeZone =
  typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Bogota";

export default function NewEspecialistaForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await createEspecialista(formData);
      } catch (e: unknown) {
        unstable_rethrow(e);
        if (e instanceof Error) setError(e.message);
      }
    });
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo *
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="Ej: María García"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Especialidad *
        </label>
        <input
          type="text"
          name="specialty"
          required
          placeholder="Ej: Medicina general, Pediatría, Cardiología..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="especialista@correo.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Se usa para invitarlo al evento de Google Calendar.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona horaria *
          </label>
          <input
            type="text"
            name="timeZone"
            required
            defaultValue={detectedTimeZone}
            placeholder="America/Bogota"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Zona IANA. Define jornada y horarios de la agenda.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inicio jornada *
          </label>
          <input
            type="time"
            name="workStart"
            defaultValue="08:00"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fin jornada *
          </label>
          <input
            type="time"
            name="workEnd"
            defaultValue="17:00"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duración de cada cita *
        </label>
        <SlotDurationSelect />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Guardando..." : "Guardar especialista"}
        </button>
        <a
          href="/panel/especialistas"
          className="flex-1 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-center"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
