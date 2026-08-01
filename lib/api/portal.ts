import { apiFetch } from "@/lib/api/client";
import type { CitaDTO, PacienteDTO } from "@/lib/api/types";
import { listEspecialistas } from "@/lib/api/especialistas";

// Vistas del portal del paciente. El back real (GET /portal/mi-perfil, /portal/citas)
// resuelve el pacienteId desde el `sub` del token de usuario (rol paciente). Mientras
// Auth0 de usuarios se termina de organizar, corremos en modo BYPASS: el pacienteId
// se elige a mano (cookie dev) y los datos se leen de los endpoints de staff con el
// token M2M. Las FORMAS de estos tipos replican los DTOs del back
// (PerfilPortalDto / CitaPortalDto) para que el swap a /portal/* sea trivial.

export type PortalPerfil = {
  id: string;
  documento: string | null;
  nombreCompleto: string;
  telefono: string;
  email: string | null;
};

export type PortalCita = {
  id: string;
  pacienteId: string;
  inicio: Date;
  fin: Date;
  estado: string;
  modalidad: "virtual" | "presencial";
  motivo: string;
  especialistaNombre: string;
  googleMeetLink: string | null;
};

export const DEV_PORTAL_BYPASS = process.env.DEV_PORTAL_BYPASS === "true";

// ── Modo bypass (dev): datos vía endpoints de staff (token M2M) ──

export const getMiPerfilBypass = async (pacienteId: string): Promise<PortalPerfil> => {
  const dto = await apiFetch<PacienteDTO>(`/pacientes/${pacienteId}`);
  return {
    id: dto.id,
    documento: dto.documento ?? null,
    nombreCompleto: dto.nombreCompleto,
    telefono: dto.telefono,
    email: dto.email ?? null,
  };
};

export const getMisCitasBypass = async (pacienteId: string): Promise<PortalCita[]> => {
  // /citas no filtra por pacienteId, así que traemos todas y filtramos en el cliente
  // (esto es solo el atajo de dev; el portal real filtra por token en el back).
  const [citas, especialistas] = await Promise.all([
    apiFetch<CitaDTO[]>("/citas"),
    listEspecialistas({ onlyActive: false }),
  ]);
  const especialistaName = new Map(especialistas.map((d) => [d.id, d.name]));

  return citas
    .filter((c) => c.pacienteId === pacienteId)
    .map((c) => ({
      id: c.id,
      pacienteId: c.pacienteId,
      inicio: new Date(c.inicio),
      fin: c.fin ? new Date(c.fin) : new Date(new Date(c.inicio).getTime() + c.duracionMin * 60_000),
      estado: c.estado,
      modalidad: c.modalidad ?? "presencial",
      motivo: c.motivo,
      especialistaNombre: especialistaName.get(c.especialistaId) ?? "(especialista)",
      googleMeetLink: c.googleMeetLink ?? null,
    }))
    .sort((a, b) => b.inicio.getTime() - a.inicio.getTime());
};
