import { getEspecialista } from "@/lib/api/especialistas";
import { getAvailableDates } from "@/lib/availability";
import { notFound } from "next/navigation";
import Link from "next/link";
import SlotPicker from "./SlotPicker";
import BookingProgress from "@/app/booking/BookingProgress";

export default async function BookingEspecialistaPage({
  params,
}: {
  params: Promise<{ especialistaId: string }>;
}) {
  const { especialistaId } = await params;

  const especialista = await getEspecialista(especialistaId);
  if (!especialista) notFound();

  const availableDates = getAvailableDates(3).map(
    (d) => d.toISOString().slice(0, 10)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl">
        <BookingProgress current={1} />
        <Link
          href="/booking"
          className="text-sm text-blue-600 hover:underline mb-6 inline-block"
        >
          ← Volver
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
            {especialista.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dr. {especialista.name}</h1>
            <p className="text-gray-500">{especialista.specialty}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Duración de cada cita: <strong>{especialista.slotDuration} minutos</strong>
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <SlotPicker
            especialista={especialista}
            availableDates={availableDates}
          />
        </div>
      </div>
    </div>
  );
}
