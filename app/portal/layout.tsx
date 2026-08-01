import Link from "next/link";
import { DEV_PORTAL_BYPASS } from "@/lib/api/portal";
import { getDevPortalPacienteId } from "@/lib/devPortal";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const pacienteId = DEV_PORTAL_BYPASS ? await getDevPortalPacienteId() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/portal" className="font-semibold text-blue-600 tracking-tight">
            Mi portal
          </Link>
          {pacienteId && (
            <nav className="flex gap-4 text-sm">
              <Link href="/portal/mi-perfil" className="text-gray-600 hover:text-gray-900">
                Mi perfil
              </Link>
              <Link href="/portal/mis-citas" className="text-gray-600 hover:text-gray-900">
                Mis citas
              </Link>
            </nav>
          )}
          {DEV_PORTAL_BYPASS && (
            <span className="ml-auto text-xs bg-amber-100 text-amber-800 border border-amber-200 rounded px-2 py-0.5">
              modo bypass (dev)
            </span>
          )}
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
