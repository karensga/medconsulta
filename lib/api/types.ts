// Formas de datos tal como las expone la API real (campos en español).
// Basado en la colección Bruno de /Downloads/api — no hay ejemplos de respuesta
// documentados ahí, así que estos tipos son la mejor inferencia a partir de los
// bodies de creación/actualización. Si al correr la app contra la API real algún
// campo no calza, es el primer lugar para ajustar.

export type EspecialistaDTO = {
  id: string;
  nombreCompleto: string;
  especialidad: string;
  inicioJornada: string; // "08:00"
  finJornada: string; // "17:00"
  duracionCitaMin: number;
  email?: string | null;
  timeZone?: string | null; // zona IANA, ej. "America/Bogota"
  activo: boolean;
};

export type PacienteDTO = {
  id: string;
  documento?: string | null;
  nombreCompleto: string;
  telefono: string;
  email?: string | null;
  notas?: string | null;
};

// Estados soportados por el back (enum EstadoCita): solo estos tres.
export type EstadoCita = "programada" | "completada" | "cancelada";

export type ModalidadCita = "virtual" | "presencial";
export type EstadoSyncGoogle = "pendiente" | "sincronizada" | "error" | "no_aplica";

export type RecordatorioDTO = {
  method: "email" | "popup";
  minutes: number;
};

export type CitaDTO = {
  id: string;
  especialistaId: string;
  pacienteId: string;
  inicio: string; // ISO datetime con offset
  fin?: string;
  duracionMin: number;
  motivo: string;
  notas?: string | null;
  estado: EstadoCita;
  modalidad: ModalidadCita;
  recordatorios?: RecordatorioDTO[] | null;
  googleMeetLink?: string | null;
  googleHtmlLink?: string | null;
  googleSyncEstado?: EstadoSyncGoogle | null;
};

export type AdjuntoDTO = {
  nombre: string;
  url: string;
  tipo: string;
};

export type NotaClinicaDTO = {
  id: string;
  pacienteId: string;
  especialistaId: string;
  citaId?: string | null;
  contenido: string;
  diagnosticos?: string[];
  tags?: string[];
  adjuntos?: AdjuntoDTO[];
};

// Forma de la lista devuelta por GET /citas/disponibilidad. No hay ejemplo de
// respuesta en la colección — se soportan varias formas plausibles en el mapper
// (lib/availability.ts). Este tipo documenta la forma "esperada" más probable.
export type SlotDisponibilidadDTO = {
  inicio: string;
  fin?: string;
  disponible?: boolean;
};
