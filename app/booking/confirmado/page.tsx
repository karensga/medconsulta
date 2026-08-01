import { getAppointment } from "@/lib/api/appointments";
import Link from "next/link";
import BookingProgress from "@/app/booking/BookingProgress";
import { CheckCircle } from "lucide-react";

export default async function ConfirmadoPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  const appt = id ? await getAppointment(id) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <BookingProgress current={2} />
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-95 duration-200 delay-150">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Cita confirmada!
        </h1>
        <p className="text-gray-500 mb-6">
          Tu reserva fue registrada exitosamente.
        </p>

        {appt && (
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <Row label="Paciente" value={appt.patient.name} />
            <Row label="Especialista" value={`Dr. ${appt.especialista.name}`} />
            <Row label="Especialidad" value={appt.especialista.specialty} />
            <Row
              label="Fecha"
              value={appt.startTime.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <Row
              label="Horario"
              value={`${appt.startTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} – ${appt.endTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`}
            />
            <Row label="Motivo" value={appt.reason} />
          </div>
        )}

        <p className="text-xs text-gray-400 mb-6">
          Si necesitas cancelar o reagendar, comunícate directamente con la clínica.
        </p>

        <Link
          href="/booking"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  );
}
