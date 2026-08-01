import { DEV_PORTAL_BYPASS } from "@/lib/api/portal";
import { getDevPortalPacienteId } from "@/lib/devPortal";
import { listPatients } from "@/lib/api/patients";
import { selectDevPortalPaciente } from "@/app/actions/devPortal";
import Link from "next/link";

// Página de entrada del portal. En modo bypass permite elegir a mano qué paciente
// impersonar (sustituye al login real de Auth0, aún por organizar).
export default async function PortalHomePage() {
  if (!DEV_PORTAL_BYPASS) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center space-y-2">
        <h1 className="text-lg font-semibold text-gray-800">Portal del paciente</h1>
        <p className="text-sm text-gray-500">
          El acceso requiere iniciar sesión. El login de pacientes está en preparación.
        </p>
      </div>
    );
  }

  const [pacienteId, patients] = await Promise.all([
    getDevPortalPacienteId(),
    listPatients(),
  ]);
  const actual = patients.find((p) => p.id === pacienteId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Portal del paciente</h1>
        <p className="text-sm text-gray-500 mt-1">
          Modo bypass: elige un paciente para revisar sus vistas del portal.
        </p>
      </div>

      {actual && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          Viendo como <span className="font-medium">{actual.name}</span>.{" "}
          <Link href="/portal/mi-perfil" className="underline">Ir a mi perfil →</Link>
        </div>
      )}

      <form action={selectDevPortalPaciente} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700">Paciente</label>
        <select
          name="pacienteId"
          defaultValue={pacienteId ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">— Selecciona un paciente —</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.documentId ? ` · ${p.documentId}` : ""}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Entrar como este paciente
        </button>
      </form>
    </div>
  );
}
