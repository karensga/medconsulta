import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/app/ui/DeleteButton";
import { deleteDoctor } from "@/app/actions/doctors";
import ToastTrigger from "@/app/ui/ToastTrigger";
import { Suspense } from "react";
import { Stethoscope } from "lucide-react";

export default async function DoctorsPage() {
  const doctors = await prisma.doctor.findMany({
    include: { _count: { select: { appointments: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <Suspense><ToastTrigger /></Suspense>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doctores</h1>
        <Link
          href="/doctors/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo doctor
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Sin doctores registrados</p>
            <p className="text-xs text-gray-400 mt-0.5">Agrega el primer doctor para empezar a agendar citas</p>
          </div>
          <Link
            href="/doctors/new"
            className="mt-1 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar doctor
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {doctors.map((doctor) => {
            const deleteDoctorById = deleteDoctor.bind(null, doctor.id);
            return (
              <div key={doctor.id} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50/70 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
                  {doctor.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Dr. {doctor.name}</p>
                  <p className="text-xs text-gray-500">{doctor.specialty}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {doctor.workStart}–{doctor.workEnd} · {doctor.slotDuration} min/cita · {doctor._count.appointments} citas
                  </p>
                </div>
                <DeleteButton
                  action={deleteDoctorById}
                  label="Eliminar"
                  confirmMessage={`¿Eliminar al Dr. ${doctor.name}? Se eliminarán todas sus citas asociadas.`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
