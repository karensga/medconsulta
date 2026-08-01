import { redirect } from "next/navigation";
import { DEV_PORTAL_BYPASS, getMisCitasBypass } from "@/lib/api/portal";
import { getDevPortalPacienteId } from "@/lib/devPortal";

const ESTADO_LABEL: Record<string, string> = {
  programada: "Programada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const ESTADO_STYLE: Record<string, string> = {
  programada: "bg-blue-50 text-blue-700 border-blue-200",
  completada: "bg-green-50 text-green-700 border-green-200",
  cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function MisCitasPage() {
  if (!DEV_PORTAL_BYPASS) redirect("/portal");
  const pacienteId = await getDevPortalPacienteId();
  if (!pacienteId) redirect("/portal");

  const citas = await getMisCitasBypass(pacienteId);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Mis citas</h1>

      {citas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-12 text-center text-sm text-gray-500">
          No tienes citas registradas.
        </div>
      ) : (
        <ul className="space-y-3">
          {citas.map((c) => (
            <li key={c.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{c.motivo}</p>
                  <p className="text-sm text-gray-500">con {c.especialistaNombre}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${ESTADO_STYLE[c.estado] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  {ESTADO_LABEL[c.estado] ?? c.estado}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {c.inicio.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                {" · "}
                {c.inicio.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                {" – "}
                {c.fin.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                <span className="text-gray-400 ml-2">
                  ({c.modalidad === "virtual" ? "Virtual" : "Presencial"})
                </span>
              </p>
              {c.modalidad === "virtual" && c.googleMeetLink && (
                <a
                  href={c.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Unirse a la videollamada
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
