"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { updatePatient } from "@/app/actions/patients";
import type { Patient } from "@/lib/api/patients";

export default function EditPatientForm({ patient }: { patient: Patient }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await updatePatient(patient.id, formData);
      } catch (e: unknown) {
        // La action termina en redirect() en el caso de éxito, lo que lanza un
        // error interno de Next (NEXT_REDIRECT) que no es un error real: hay
        // que dejarlo pasar para que Next haga la navegación.
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
          defaultValue={patient.name}
          placeholder="Ej: Juan Pérez"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Documento (RUT, DNI, cédula...)
        </label>
        <input
          type="text"
          name="documentId"
          defaultValue={patient.documentId ?? ""}
          placeholder="Ej: 12345678-9"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <input
          type="tel"
          name="phone"
          required
          defaultValue={patient.phone}
          placeholder="Ej: +56 9 1234 5678"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          defaultValue={patient.email ?? ""}
          placeholder="opcional@email.com"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas / Antecedentes
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={patient.notes ?? ""}
          placeholder="Alergias, condiciones previas, observaciones..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
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
          href="/panel/patients"
          className="flex-1 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-center"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
