import { apiFetch, ifNotFound } from "@/lib/api/client";
import type { EspecialistaDTO } from "@/lib/api/types";

// Tipo interno que usa el resto de la app (mismo shape que el modelo Especialista de
// Prisma que reemplazamos, para minimizar cambios en componentes/páginas).
export type Especialista = {
  id: string;
  name: string;
  specialty: string;
  workStart: string;
  workEnd: string;
  slotDuration: number;
  email: string | null;
  timeZone: string | null;
  active: boolean;
};

const toEspecialista = (dto: EspecialistaDTO): Especialista => ({
  id: dto.id,
  name: dto.nombreCompleto,
  specialty: dto.especialidad,
  workStart: dto.inicioJornada,
  workEnd: dto.finJornada,
  slotDuration: dto.duracionCitaMin,
  email: dto.email ?? null,
  timeZone: dto.timeZone ?? null,
  active: dto.activo,
});

export const listEspecialistas = async (opts: { onlyActive?: boolean } = {}): Promise<Especialista[]> => {
  const dtos = await apiFetch<EspecialistaDTO[]>("/especialistas", {
    searchParams: { activo: opts.onlyActive === false ? undefined : "true" },
  });
  return dtos.map(toEspecialista).sort((a, b) => a.name.localeCompare(b.name));
};

export const getEspecialista = async (id: string): Promise<Especialista | null> =>
  ifNotFound(async () => toEspecialista(await apiFetch<EspecialistaDTO>(`/especialistas/${id}`)));

export const createEspecialista = async (input: {
  name: string;
  specialty: string;
  workStart: string;
  workEnd: string;
  slotDuration: number;
  email?: string | null;
  timeZone: string; // el front SIEMPRE lo envía explícito (ver API.md)
}): Promise<Especialista> => {
  const dto = await apiFetch<EspecialistaDTO>("/especialistas", {
    method: "POST",
    body: {
      nombreCompleto: input.name,
      especialidad: input.specialty,
      inicioJornada: input.workStart,
      finJornada: input.workEnd,
      duracionCitaMin: input.slotDuration,
      email: input.email ?? undefined,
      timeZone: input.timeZone,
      activo: true,
    },
  });
  return toEspecialista(dto);
};

export const updateEspecialista = async (
  id: string,
  input: {
    name?: string;
    specialty?: string;
    workStart?: string;
    workEnd?: string;
    slotDuration?: number;
    email?: string | null;
    timeZone?: string;
    active?: boolean;
  }
): Promise<Especialista> => {
  const dto = await apiFetch<EspecialistaDTO>(`/especialistas/${id}`, {
    method: "PATCH",
    body: {
      nombreCompleto: input.name,
      especialidad: input.specialty,
      inicioJornada: input.workStart,
      finJornada: input.workEnd,
      duracionCitaMin: input.slotDuration,
      email: input.email ?? undefined,
      timeZone: input.timeZone,
      activo: input.active,
    },
  });
  return toEspecialista(dto);
};

export const deleteEspecialista = async (id: string): Promise<void> => {
  await apiFetch(`/especialistas/${id}`, { method: "DELETE" });
};
