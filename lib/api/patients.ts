import { apiFetch, ifNotFound } from "@/lib/api/client";
import type { PacienteDTO } from "@/lib/api/types";

export type Patient = {
  id: string;
  documentId: string | null;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
};

const toPatient = (dto: PacienteDTO): Patient => ({
  id: dto.id,
  documentId: dto.documento ?? null,
  name: dto.nombreCompleto,
  phone: dto.telefono,
  email: dto.email ?? null,
  notes: dto.notas ?? null,
});

export const listPatients = async (opts: { search?: string } = {}): Promise<Patient[]> => {
  const dtos = await apiFetch<PacienteDTO[]>("/pacientes", {
    searchParams: { texto: opts.search },
  });
  return dtos.map(toPatient).sort((a, b) => a.name.localeCompare(b.name));
};

export const getPatient = async (id: string): Promise<Patient | null> =>
  ifNotFound(async () => toPatient(await apiFetch<PacienteDTO>(`/pacientes/${id}`)));

export const getPatientByDocument = async (document: string): Promise<Patient | null> =>
  ifNotFound(async () =>
    toPatient(await apiFetch<PacienteDTO>(`/pacientes/documento/${encodeURIComponent(document)}`))
  );

export const findPatientByPhone = async (phone: string): Promise<Patient | null> => {
  // La API no documenta búsqueda exacta por teléfono; se usa la búsqueda de texto
  // libre (?texto=) y se filtra por coincidencia exacta de teléfono en el cliente.
  const dtos = await apiFetch<PacienteDTO[]>("/pacientes", { searchParams: { texto: phone } });
  const match = dtos.find((d) => d.telefono === phone);
  return match ? toPatient(match) : null;
};

export const createPatient = async (input: {
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  documentId?: string | null;
}): Promise<Patient> => {
  const dto = await apiFetch<PacienteDTO>("/pacientes", {
    method: "POST",
    body: {
      nombreCompleto: input.name,
      telefono: input.phone,
      email: input.email ?? undefined,
      notas: input.notes ?? undefined,
      documento: input.documentId ?? undefined,
    },
  });
  return toPatient(dto);
};

export const updatePatient = async (
  id: string,
  input: {
    name?: string;
    phone?: string;
    email?: string | null;
    notes?: string | null;
    documentId?: string | null;
  }
): Promise<Patient> => {
  const dto = await apiFetch<PacienteDTO>(`/pacientes/${id}`, {
    method: "PATCH",
    body: {
      nombreCompleto: input.name,
      telefono: input.phone,
      email: input.email ?? undefined,
      notas: input.notes ?? undefined,
      documento: input.documentId ?? undefined,
    },
  });
  return toPatient(dto);
};

export const deletePatient = async (id: string): Promise<void> => {
  await apiFetch(`/pacientes/${id}`, { method: "DELETE" });
};
