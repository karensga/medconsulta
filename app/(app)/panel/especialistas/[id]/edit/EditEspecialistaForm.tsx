"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { updateEspecialista } from "@/app/actions/especialistas";
import SlotDurationSelect from "@/app/(app)/panel/especialistas/new/SlotDurationSelect";
import type { Especialista } from "@/lib/api/especialistas";

export default function EditEspecialistaForm({ especialista }: { especialista: Especialista }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await updateEspecialista(especialista.id, formData);
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
          defaultValue={especialista.name}
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
          defaultValue={especialista.specialty}
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
            defaultValue={especialista.email ?? ""}
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
            defaultValue={especialista.timeZone ?? ""}
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
            defaultValue={especialista.workStart}
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
            defaultValue={especialista.workEnd}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duración de cada cita *
        </label>
        <SlotDurationSelect defaultValue={String(especialista.slotDuration)} />
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
          {isPending ? "Guardando..." : "Guardar cambios"}
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
