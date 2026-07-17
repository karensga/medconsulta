import { prisma } from "@/lib/prisma";
import { getAvailableDates } from "@/lib/availability";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/app/ui/StatusBadge";
import StatusSelector from "@/app/ui/StatusSelector";
import DeleteButton from "@/app/ui/DeleteButton";
import RescheduleForm from "./RescheduleForm";
import { deleteAppointment } from "@/app/actions/appointments";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true, patient: true },
  });

  if (!appt) notFound();

  const currentDuration = Math.round(
    (appt.endTime.getTime() - appt.startTime.getTime()) / 60_000
  );
  const availableDates = getAvailableDates(4).map((d) =>
    d.toISOString().slice(0, 10)
  );

  const deleteApptById = deleteAppointment.bind(null, appt.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/appointments" className="text-sm text-blue-600 hover:underline">
          ← Volver a citas
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold">Detalle de cita</h1>
          <StatusBadge status={appt.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Columna izquierda: info + eliminar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            <Row label="Paciente" value={appt.patient.name} />
            <Row label="Teléfono" value={appt.patient.phone} />
            <Row
              label="Doctor"
              value={`Dr. ${appt.doctor.name} — ${appt.doctor.specialty}`}
            />
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
              value={`${appt.startTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} — ${appt.endTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`}
            />
            <Row label="Motivo" value={appt.reason} />
            {appt.notes && <Row label="Notas" value={appt.notes} />}
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Estado</span>
              <StatusSelector appointmentId={appt.id} currentStatus={appt.status} />
            </div>
          </div>

          <div className="flex justify-end">
            <DeleteButton
              action={deleteApptById}
              label="Eliminar cita"
              confirmMessage="¿Eliminar esta cita? Esta acción no se puede deshacer."
            />
          </div>
        </div>

        {/* Columna derecha: reagendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Reagendar cita
          </h2>
          <RescheduleForm
            appointmentId={appt.id}
            doctorId={appt.doctorId}
            defaultDuration={currentDuration}
            availableDates={availableDates}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 flex items-start justify-between gap-4">
      <span className="text-sm font-medium text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value}</span>
    </div>
  );
}
