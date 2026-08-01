import { listEspecialistas } from "@/lib/api/especialistas";
import { getAvailableDates } from "@/lib/availability";
import Link from "next/link";
import NewAppointmentForm from "./NewAppointmentForm";

export default async function NewAppointmentPage() {
  const especialistas = await listEspecialistas();

  if (especialistas.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">
          Primero necesitas registrar al menos un especialista.
        </p>
        <Link
          href="/panel/especialistas/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Agregar especialista
        </Link>
      </div>
    );
  }

  const availableDates = getAvailableDates(4).map((d) =>
    d.toISOString().slice(0, 10)
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/panel/appointments"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver a citas
        </Link>
        <h1 className="text-2xl font-bold mt-2">Nueva cita</h1>
      </div>
      <NewAppointmentForm especialistas={especialistas} availableDates={availableDates} />
    </div>
  );
}
