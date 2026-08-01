import { listPatients } from "@/lib/api/patients";
import { listAppointments } from "@/lib/api/appointments";
import Link from "next/link";
import DeleteButton from "@/app/ui/DeleteButton";
import { deletePatient } from "@/app/actions/patients";
import ToastTrigger from "@/app/ui/ToastTrigger";
import { Suspense } from "react";
import { Users } from "lucide-react";

export default async function PatientsPage() {
  const [patientList, appointments] = await Promise.all([listPatients(), listAppointments()]);

  const appointmentCountByPatient = new Map<string, number>();
  for (const appt of appointments) {
    appointmentCountByPatient.set(appt.patientId, (appointmentCountByPatient.get(appt.patientId) ?? 0) + 1);
  }
  const patients = patientList.map((p) => ({
    ...p,
    _count: { appointments: appointmentCountByPatient.get(p.id) ?? 0 },
  }));

  return (
    <div className="space-y-6">
      <Suspense><ToastTrigger /></Suspense>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <Link
          href="/panel/patients/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-[background-color,transform] duration-150 active:scale-[0.97]"
        >
          + Nuevo paciente
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Sin pacientes registrados</p>
            <p className="text-xs text-gray-400 mt-0.5">Los pacientes se agregan al crear la primera cita</p>
          </div>
          <Link
            href="/panel/patients/new"
            className="mt-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar paciente
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {patients.map((patient, i) => {
            const deletePatientById = deletePatient.bind(null, patient.id);
            return (
              <div key={patient.id} style={{ animationDelay: `${i * 40}ms` }} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50/70 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both ease-[var(--ease-out)]">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm shrink-0">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{patient.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {patient.phone}
                    {patient.email ? ` · ${patient.email}` : ""} · {patient._count.appointments} citas
                  </p>
                  {patient.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{patient.notes}</p>
                  )}
                </div>
                <Link
                  href={`/panel/patients/${patient.id}/edit`}
                  className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Editar
                </Link>
                <DeleteButton
                  action={deletePatientById}
                  label="Eliminar"
                  confirmMessage={`¿Eliminar a ${patient.name}? Esta acción no se puede deshacer.`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
