import { listEspecialistas } from "@/lib/api/especialistas";
import Link from "next/link";
import BookingProgress from "@/app/booking/BookingProgress";

export default async function BookingHomePage() {
  const especialistas = await listEspecialistas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-start px-4 py-16">
      <div className="w-full max-w-xl">
        <BookingProgress current={0} />
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Reservar cita</h1>
          <p className="text-gray-500 mt-2">Elige el especialista con quien quieres agendar</p>
        </div>

        {especialistas.length === 0 ? (
          <p className="text-center text-gray-500">No hay especialistas disponibles en este momento.</p>
        ) : (
          <div className="space-y-3">
            {especialistas.map((especialista) => (
              <Link
                key={especialista.id}
                href={`/booking/${especialista.id}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0 group-hover:bg-blue-200 transition-colors">
                  {especialista.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Dr. {especialista.name}</p>
                  <p className="text-sm text-gray-500">{especialista.specialty}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Horario: {especialista.workStart} – {especialista.workEnd}
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
