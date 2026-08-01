import { apiFetch, ifNotFound } from "@/lib/api/client";
import type { CitaDTO } from "@/lib/api/types";
import type { AppointmentWithRelations } from "@/lib/types";
import { listEspecialistas, getEspecialista, type Especialista } from "@/lib/api/especialistas";
import { listPatients, getPatient, type Patient } from "@/lib/api/patients";

// Mapeo de estado interno (UI: StatusBadge, StatusSelector, AppointmentFilters)
// al valor que espera la API. El back (enum EstadoCita) SOLO soporta estos tres:
// no existe "reprogramada". Reprogramar cambia la hora y mantiene "programada".
const STATUS_TO_ESTADO: Record<string, string> = {
  SCHEDULED: "programada",
  COMPLETED: "completada",
  CANCELLED: "cancelada",
};
const ESTADO_TO_STATUS: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_TO_ESTADO).map(([status, estado]) => [estado, status])
);

const estadoToStatus = (estado: string): string =>
  ESTADO_TO_STATUS[estado] ?? estado.toUpperCase();
const statusToEstado = (status: string): string =>
  STATUS_TO_ESTADO[status] ?? status.toLowerCase();

const toAppointment = (
  dto: CitaDTO,
  especialistasById: Map<string, Especialista>,
  patientsById: Map<string, Patient>
): AppointmentWithRelations => {
  const startTime = new Date(dto.inicio);
  const endTime = dto.fin
    ? new Date(dto.fin)
    : new Date(startTime.getTime() + dto.duracionMin * 60_000);
  const especialista = especialistasById.get(dto.especialistaId);
  const patient = patientsById.get(dto.pacienteId);

  return {
    id: dto.id,
    startTime,
    endTime,
    reason: dto.motivo,
    status: estadoToStatus(dto.estado),
    notes: dto.notas ?? null,
    especialistaId: dto.especialistaId,
    patientId: dto.pacienteId,
    modalidad: dto.modalidad ?? "presencial",
    googleMeetLink: dto.googleMeetLink ?? null,
    googleHtmlLink: dto.googleHtmlLink ?? null,
    googleSyncEstado: dto.googleSyncEstado ?? null,
    especialista: especialista
      ? { id: especialista.id, name: especialista.name, specialty: especialista.specialty }
      : { id: dto.especialistaId, name: "(especialista no encontrado)", specialty: "" },
    patient: patient
      ? { id: patient.id, name: patient.name, phone: patient.phone, email: patient.email }
      : { id: dto.pacienteId, name: "(paciente no encontrado)", phone: "", email: null },
  };
};

export type AppointmentFilters = {
  status?: string;
  especialistaId?: string;
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  search?: string; // filtro por nombre de paciente, aplicado en el cliente (la API no lo soporta)
};

export const listAppointments = async (
  filters: AppointmentFilters = {}
): Promise<AppointmentWithRelations[]> => {
  const [dtos, especialistas, patients] = await Promise.all([
    apiFetch<CitaDTO[]>("/citas", {
      searchParams: {
        estado: filters.status ? statusToEstado(filters.status) : undefined,
        especialistaId: filters.especialistaId,
        desde: filters.from,
        hasta: filters.to,
      },
    }),
    listEspecialistas({ onlyActive: false }),
    listPatients(),
  ]);

  const especialistasById = new Map(especialistas.map((d) => [d.id, d]));
  const patientsById = new Map(patients.map((p) => [p.id, p]));

  let appointments = dtos
    .map((dto) => toAppointment(dto, especialistasById, patientsById))
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  if (filters.search) {
    const needle = filters.search.toLowerCase();
    appointments = appointments.filter((a) => a.patient.name.toLowerCase().includes(needle));
  }

  return appointments;
};

export const getAppointment = async (id: string): Promise<AppointmentWithRelations | null> =>
  ifNotFound(async () => {
    const dto = await apiFetch<CitaDTO>(`/citas/${id}`);
    const [especialista, patient] = await Promise.all([
      getEspecialista(dto.especialistaId),
      getPatient(dto.pacienteId),
    ]);
    return toAppointment(
      dto,
      new Map(especialista ? [[especialista.id, especialista]] : []),
      new Map(patient ? [[patient.id, patient]] : [])
    );
  });

export const createAppointment = async (input: {
  especialistaId: string;
  patientId: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  modalidad: "virtual" | "presencial";
  notes?: string | null;
  recordatorios?: { method: "email" | "popup"; minutes: number }[];
}): Promise<{ id: string }> => {
  const duracionMin = Math.round((input.endTime.getTime() - input.startTime.getTime()) / 60_000);
  const dto = await apiFetch<CitaDTO>("/citas", {
    method: "POST",
    body: {
      especialistaId: input.especialistaId,
      pacienteId: input.patientId,
      inicio: input.startTime.toISOString(),
      duracionMin,
      motivo: input.reason,
      modalidad: input.modalidad,
      notas: input.notes ?? undefined,
      recordatorios: input.recordatorios,
    },
  });
  return { id: dto.id };
};

export const updateAppointmentTime = async (
  id: string,
  input: { startTime: Date; endTime: Date }
): Promise<void> => {
  const duracionMin = Math.round((input.endTime.getTime() - input.startTime.getTime()) / 60_000);
  await apiFetch(`/citas/${id}`, {
    method: "PATCH",
    body: {
      inicio: input.startTime.toISOString(),
      duracionMin,
    },
  });
};

export const updateAppointmentStatus = async (id: string, status: string): Promise<void> => {
  await apiFetch(`/citas/${id}/estado`, {
    method: "PATCH",
    body: { estado: statusToEstado(status) },
  });
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await apiFetch(`/citas/${id}`, { method: "DELETE" });
};
