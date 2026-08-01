// Cliente para /notas-clinicas. La app todavía no tiene UI para esto (es una
// entidad nueva que no existía en el modelo local con Prisma) — se deja lista
// para conectar cuando se decida construir esa pantalla.
import { apiFetch, ifNotFound } from "@/lib/api/client";
import type { NotaClinicaDTO } from "@/lib/api/types";

export type ClinicalNote = {
  id: string;
  patientId: string;
  especialistaId: string;
  appointmentId: string | null;
  content: string;
  diagnoses: string[];
  tags: string[];
  attachments: { name: string; url: string; type: string }[];
};

const toNote = (dto: NotaClinicaDTO): ClinicalNote => ({
  id: dto.id,
  patientId: dto.pacienteId,
  especialistaId: dto.especialistaId,
  appointmentId: dto.citaId ?? null,
  content: dto.contenido,
  diagnoses: dto.diagnosticos ?? [],
  tags: dto.tags ?? [],
  attachments: (dto.adjuntos ?? []).map((a) => ({ name: a.nombre, url: a.url, type: a.tipo })),
});

export const listNotesForPatient = async (patientId: string): Promise<ClinicalNote[]> => {
  const dtos = await apiFetch<NotaClinicaDTO[]>("/notas-clinicas", {
    searchParams: { pacienteId: patientId },
  });
  return dtos.map(toNote);
};

export const getNote = async (id: string): Promise<ClinicalNote | null> =>
  ifNotFound(async () => toNote(await apiFetch<NotaClinicaDTO>(`/notas-clinicas/${id}`)));

export const createNote = async (input: {
  patientId: string;
  especialistaId: string;
  appointmentId?: string | null;
  content: string;
  diagnoses?: string[];
  tags?: string[];
  attachments?: { name: string; url: string; type: string }[];
}): Promise<ClinicalNote> => {
  const dto = await apiFetch<NotaClinicaDTO>("/notas-clinicas", {
    method: "POST",
    body: {
      pacienteId: input.patientId,
      especialistaId: input.especialistaId,
      citaId: input.appointmentId ?? undefined,
      contenido: input.content,
      diagnosticos: input.diagnoses ?? [],
      tags: input.tags ?? [],
      adjuntos: (input.attachments ?? []).map((a) => ({ nombre: a.name, url: a.url, tipo: a.type })),
    },
  });
  return toNote(dto);
};

export const updateNote = async (
  id: string,
  input: Partial<{ content: string; tags: string[]; diagnoses: string[] }>
): Promise<void> => {
  await apiFetch(`/notas-clinicas/${id}`, {
    method: "PATCH",
    body: {
      contenido: input.content,
      tags: input.tags,
      diagnosticos: input.diagnoses,
    },
  });
};

export const deleteNote = async (id: string): Promise<void> => {
  await apiFetch(`/notas-clinicas/${id}`, { method: "DELETE" });
};
