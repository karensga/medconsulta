import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BookingProgress from "@/app/booking/BookingProgress";

export default async function BookingHomePage() {
  const doctors = await prisma.doctor.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-start px-4 py-16">
      <div className="w-full max-w-xl">
        <BookingProgress current={0} />
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Reservar cita</h1>
          <p className="text-gray-500 mt-2">Elige el especialista con quien quieres agendar</p>
        </div>

        {doctors.length === 0 ? (
          <p className="text-center text-gray-500">No hay doctores disponibles en este momento.</p>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/booking/${doctor.id}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0 group-hover:bg-blue-200 transition-colors">
                  {doctor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Dr. {doctor.name}</p>
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Horario: {doctor.workStart} – {doctor.workEnd}
                  </p>
                </div>
                <span className="text-blue-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Ver disponibilidad →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
