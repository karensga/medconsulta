import { getGoogleStatus } from "@/lib/api/google";
import { disconnectGoogleAction } from "@/app/actions/google";
import DeleteButton from "@/app/ui/DeleteButton";
import ToastTrigger from "@/app/ui/ToastTrigger";
import ConnectGoogleButton from "./ConnectGoogleButton";
import GoogleConnectModal from "./GoogleConnectModal";
import { Suspense } from "react";
import { CircleAlert, CalendarDays } from "lucide-react";

export default async function IntegracionesPage() {
  const status = await getGoogleStatus();

  return (
    <div className="space-y-6 max-w-2xl">
      <Suspense><ToastTrigger /></Suspense>
      <Suspense><GoogleConnectModal /></Suspense>

      <div>
        <h1 className="text-2xl font-bold">Integraciones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Conecta servicios externos del consultorio.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center shrink-0 bg-white">
            <CalendarDays className="w-5 h-5 text-[#1a73e8]" />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">Google Calendar + Meet</span>
                  {status.conectado ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                      <CircleAlert className="w-3 h-3" />
                      Sin conectar
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-gray-500 mt-1 leading-snug">
                  Cada cita genera un evento en Google Calendar.
                  Las virtuales incluyen enlace de Meet.
                </p>
              </div>

              {status.conectado ? (
                <DeleteButton
                  action={disconnectGoogleAction}
                  label="Desconectar"
                  loadingLabel="Desconectando..."
                  confirmMessage="¿Desconectar Google Calendar? Las citas nuevas dejarán de sincronizarse."
                  buttonClassName="text-[11px] text-gray-400 hover:text-red-500 transition-colors shrink-0 whitespace-nowrap mt-0.5"
                />
              ) : (
                <ConnectGoogleButton />
              )}
            </div>

            {status.conectado && status.actualizadoEl && (
              <p className="text-[11px] text-gray-400 mt-2.5 pt-2.5 border-t border-gray-100">
                Sincronizado el {new Date(status.actualizadoEl).toLocaleString("es-ES")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
