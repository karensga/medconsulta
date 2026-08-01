import { listAppointments } from "@/lib/api/appointments";
import { listEspecialistas } from "@/lib/api/especialistas";
import Link from "next/link";
import StatusBadge from "@/app/ui/StatusBadge";
import AppointmentFilters from "@/app/(app)/panel/appointments/AppointmentFilters";
import ToastTrigger from "@/app/ui/ToastTrigger";
import { Suspense } from "react";
import { CalendarX } from "lucide-react";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; especialistaId?: string; search?: string; from?: string; to?: string }>;
}) {
  const { status, especialistaId, search, from, to } = await searchParams;

  const [appointments, especialistas] = await Promise.all([
    listAppointments({ status, especialistaId, search, from, to }),
    listEspecialistas({ onlyActive: false }),
  ]);

  return (
    <div className="space-y-5">
      <Suspense><ToastTrigger /></Suspense>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Citas</h1>
        <Link
          href="/panel/appointments/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-[background-color,transform] duration-150 active:scale-[0.97]"
        >
          + Nueva cita
        </Link>
      </div>

      <Suspense>
        <AppointmentFilters
          especialistas={especialistas}
          currentStatus={status}
          currentEspecialistaId={especialistaId}
          currentSearch={search}
          currentFrom={from}
          currentTo={to}
        />
      </Suspense>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <CalendarX className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">No se encontraron citas</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {search || from || to ? "Prueba ajustando los filtros" : "Aún no hay citas registradas"}
            </p>
          </div>
          {!search && !from && !to && (
            <Link
              href="/panel/appointments/new"
              className="mt-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar primera cita
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {appointments.map((appt, i) => (
            <div key={appt.id} style={{ animationDelay: `${i * 35}ms` }} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/70 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both ease-[var(--ease-out)]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-medium text-sm text-gray-700">
                    {appt.startTime.toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    {appt.startTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {appt.endTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className="font-medium text-sm truncate">{appt.patient.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {appt.reason} · Dr. {appt.especialista.name} ({appt.especialista.specialty})
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <StatusBadge status={appt.status} />
                <Link href={`/panel/appointments/${appt.id}`} className="text-xs text-blue-600 hover:underline">
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
