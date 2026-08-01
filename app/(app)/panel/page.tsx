import { listAppointments } from "@/lib/api/appointments";
import Link from "next/link";
import StatusBadge from "@/app/ui/StatusBadge";
import ToastTrigger from "@/app/ui/ToastTrigger";
import { Suspense } from "react";
import { CalendarX, Calendar, CalendarCheck, Stethoscope, CalendarRange, type LucideIcon } from "lucide-react";

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // La API filtra citas por rango de fecha (desde/hasta) y por especialista,
  // pero no da conteos agregados — se trae el rango de la semana una sola vez
  // y se calculan los indicadores en el cliente.
  const weekAppointments = await listAppointments({
    from: today.toISOString().slice(0, 10),
    to: weekEnd.toISOString().slice(0, 10),
  });

  const todayAppointments = weekAppointments
    .filter((a) => a.startTime >= today && a.startTime < tomorrow)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const todayPending = todayAppointments.filter((a) => a.status === "SCHEDULED").length;
  const todayEspecialistaIds = [...new Set(todayAppointments.map((a) => a.especialistaId))];
  const weekCount = weekAppointments.filter(
    (a) => a.startTime >= tomorrow && a.startTime < weekEnd && a.status === "SCHEDULED"
  ).length;

  return (
    <div className="space-y-8">
      <Suspense><ToastTrigger /></Suspense>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {today.toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Citas hoy" value={todayAppointments.length} color="blue" Icon={Calendar} delay={0} />
        <StatCard label="Por atender" value={todayPending} color="indigo" Icon={CalendarCheck} delay={60} />
        <StatCard label="Especialistas hoy" value={todayEspecialistaIds.length} color="green" Icon={Stethoscope} delay={120} />
        <StatCard label="Esta semana" value={weekCount} color="purple" Icon={CalendarRange} delay={180} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Citas de hoy</h2>
          <Link
            href="/panel/appointments/new"
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-[background-color,transform] duration-150 active:scale-[0.97]"
          >
            + Nueva cita
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 py-14 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <CalendarX className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Sin citas hoy</p>
              <p className="text-xs text-gray-400 mt-0.5">No hay citas programadas para hoy</p>
            </div>
            <Link
              href="/panel/appointments/new"
              className="mt-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar cita
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {todayAppointments.map((appt, i) => (
              <div key={appt.id} style={{ animationDelay: `${i * 40}ms` }} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50/70 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-200 fill-mode-both ease-[var(--ease-out)]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-500 shrink-0">
                      {appt.startTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      {" — "}
                      {appt.endTime.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="font-medium text-sm truncate mt-0.5">{appt.patient.name}</p>
                  <p className="text-xs text-gray-500 truncate">{appt.reason} · Dr. {appt.especialista.name}</p>
                </div>
                <Link
                  href={`/panel/appointments/${appt.id}`}
                  className="text-xs text-blue-600 hover:underline shrink-0"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  Icon,
  delay = 0,
}: {
  label: string;
  value: number;
  color: "blue" | "indigo" | "green" | "purple";
  Icon: LucideIcon;
  delay?: number;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div style={{ animationDelay: `${delay}ms` }} className={`rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both ease-[var(--ease-out)] ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <p className="text-3xl font-bold">{value}</p>
        <Icon className="w-5 h-5 opacity-60" />
      </div>
      <p className="text-sm mt-2 opacity-80">{label}</p>
    </div>
  );
}
