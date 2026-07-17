export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export type AppointmentWithRelations = {
  id: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  doctor: { id: string; name: string; specialty: string };
  patient: { id: string; name: string; phone: string; email: string | null };
};
