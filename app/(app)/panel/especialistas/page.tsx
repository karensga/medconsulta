import { listEspecialistas } from "@/lib/api/especialistas";
import { listAppointments } from "@/lib/api/appointments";
import Link from "next/link";
import DeleteButton from "@/app/ui/DeleteButton";
import { deleteEspecialista } from "@/app/actions/especialistas";
import ToastTrigger from "@/app/ui/ToastTrigger";
import { Suspense } from "react";
import { Stethoscope } from "lucide-react";

export default async function EspecialistasPage() {
  const [especialistaList, appointments] = await Promise.all([
    listEspecialistas({ onlyActive: false }),
    listAppointments(),
  ]);

  const appointmentCountByEspecialista = new Map<string, number>();
  for (const appt of appointments) {
    appointmentCountByEspecialista.set(appt.especialistaId, (appointmentCountByEspecialista.get(appt.especialistaId) ?? 0) + 1);
  }
  const especialistas = especialistaList.map((d) => ({
    ...d,
    _count: { appointments: appointmentCountByEspecialista.get(d.id) ?? 0 },
  }));

  return (
    <div className="space-y-6">
      <Suspense><ToastTrigger /></Suspense>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Especialistas</h1>
        <Link
          href="/panel/especialistas/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-[background-color,transform] duration-150 active:scale-[0.97]"
        >
          + Nuevo especialista
        </Link>
      </div>

      {especialistas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Sin especialistas registrados</p>
            <p className="text-xs text-gray-400 mt-0.5">Agrega el primer especialista para empezar a agendar citas</p>
          </div>
          <Link
            href="/panel/especialistas/new"
            className="mt-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar especialista
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {especialistas.map((especialista, i) => {
            const deleteEspecialistaById = deleteEspecialista.bind(null, especialista.id);
            return (
              <div key={especialista.id} style={{ animationDelay: `${i * 40}ms` }} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50/70 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both ease-[var(--ease-out)]">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
                  {especialista.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Dr. {especialista.name}</p>
                  <p className="text-xs text-gray-500">{especialista.specialty}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {especialista.workStart}–{especialista.workEnd} · {especialista.slotDuration} min/cita · {especialista._count.appointments} citas
                  </p>
                </div>
                <Link
                  href={`/panel/especialistas/${especialista.id}/edit`}
                  className="px-3 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Editar
                </Link>
                <DeleteButton
                  action={deleteEspecialistaById}
                  label="Eliminar"
                  confirmMessage={`¿Eliminar al Dr. ${especialista.name}? Se eliminarán todas sus citas asociadas.`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
