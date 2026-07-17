import { prisma } from "@/lib/prisma";
import { calendarConfigured } from "@/lib/googleCalendar";
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

  const [todayAppointments, todayPending, todayDoctorIds, weekCount] =
    await Promise.all([
      prisma.appointment.findMany({
        where: { startTime: { gte: today, lt: tomorrow } },
        include: { doctor: true, patient: true },
        orderBy: { startTime: "asc" },
      }),
      prisma.appointment.count({
        where: { startTime: { gte: today, lt: tomorrow }, status: "SCHEDULED" },
      }),
      prisma.appointment.findMany({
        where: { startTime: { gte: today, lt: tomorrow } },
        select: { doctorId: true },
        distinct: ["doctorId"],
      }),
      prisma.appointment.count({
        where: { startTime: { gte: tomorrow, lt: weekEnd }, status: "SCHEDULED" },
      }),
    ]);

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

      {!calendarConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          <strong>Google Calendar no conectado.</strong> Agrega{" "}
          <code className="bg-yellow-100 px-1 rounded">GOOGLE_SERVICE_ACCOUNT_KEY</code> y{" "}
          <code className="bg-yellow-100 px-1 rounded">GOOGLE_CALENDAR_ID</code> al{" "}
          <code className="bg-yellow-100 px-1 rounded">.env</code> para sincronizar citas.
        </div>
      )}
      {calendarConfigured && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          Google Calendar conectado. Las citas se sincronizan automáticamente.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Citas hoy" value={todayAppointments.length} color="blue" Icon={Calendar} />
        <StatCard label="Por atender" value={todayPending} color="indigo" Icon={CalendarCheck} />
        <StatCard label="Especialistas hoy" value={todayDoctorIds.length} color="green" Icon={Stethoscope} />
        <StatCard label="Esta semana" value={weekCount} color="purple" Icon={CalendarRange} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Citas de hoy</h2>
          <Link
            href="/appointments/new"
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              href="/appointments/new"
              className="mt-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar cita
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {todayAppointments.map((appt) => (
              <div key={appt.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50/70 transition-colors">
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
                  <p className="text-xs text-gray-500 truncate">{appt.reason} · Dr. {appt.doctor.name}</p>
                </div>
                <Link
                  href={`/appointments/${appt.id}`}
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
}: {
  label: string;
  value: number;
  color: "blue" | "indigo" | "green" | "purple";
  Icon: LucideIcon;
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <p className="text-3xl font-bold">{value}</p>
        <Icon className="w-5 h-5 opacity-60" />
      </div>
      <p className="text-sm mt-2 opacity-80">{label}</p>
    </div>
  );
}
