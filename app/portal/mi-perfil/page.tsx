import { redirect } from "next/navigation";
import { DEV_PORTAL_BYPASS, getMiPerfilBypass } from "@/lib/api/portal";
import { getDevPortalPacienteId } from "@/lib/devPortal";

export default async function MiPerfilPage() {
  if (!DEV_PORTAL_BYPASS) redirect("/portal");
  const pacienteId = await getDevPortalPacienteId();
  if (!pacienteId) redirect("/portal");

  const perfil = await getMiPerfilBypass(pacienteId);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Mi perfil</h1>
      <dl className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
        <Row label="Nombre" value={perfil.nombreCompleto} />
        <Row label="Documento" value={perfil.documento ?? "—"} />
        <Row label="Teléfono" value={perfil.telefono} />
        <Row label="Email" value={perfil.email ?? "—"} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 flex items-start justify-between gap-4">
      <dt className="text-sm font-medium text-gray-500 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 text-right">{value}</dd>
    </div>
  );
}
