// El back (EstadoCita) solo soporta programada/completada/cancelada. "RESCHEDULED"
// se mantiene como valor legado tolerado en la UI (badges antiguos), pero NO se
// envía nunca al back: reprogramar solo cambia la hora y el estado queda SCHEDULED.
export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export type Modalidad = "virtual" | "presencial";
export type GoogleSyncEstado =
  | "pendiente"
  | "sincronizada"
  | "error"
  | "no_aplica";

export type AppointmentWithRelations = {
  id: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  status: string;
  notes: string | null;
  especialistaId: string;
  patientId: string;
  modalidad: Modalidad;
  googleMeetLink: string | null;
  googleHtmlLink: string | null;
  googleSyncEstado: GoogleSyncEstado | null;
  especialista: { id: string; name: string; specialty: string };
  patient: { id: string; name: string; phone: string; email: string | null };
};
