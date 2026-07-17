import { createDoctor } from "@/app/actions/doctors";
import Link from "next/link";
import SlotDurationSelect from "./SlotDurationSelect";

export default function NewDoctorPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/doctors" className="text-sm text-blue-600 hover:underline">
          ← Volver a especialistas
        </Link>
        <h1 className="text-2xl font-bold mt-2">Nuevo especialista</h1>
      </div>

      <form action={createDoctor} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
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

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Guardar especialista
          </button>
          <Link
            href="/doctors"
            className="flex-1 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
