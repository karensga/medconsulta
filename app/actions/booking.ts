"use server";

import { listAppointments, createAppointment as apiCreateAppointment } from "@/lib/api/appointments";
import { findPatientByPhone, createPatient as apiCreatePatient } from "@/lib/api/patients";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createPublicAppointment = async (formData: FormData) => {
  const especialistaId = formData.get("especialistaId") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const reason = formData.get("reason") as string;
  const patientName = formData.get("patientName") as string;
  const patientPhone = formData.get("patientPhone") as string;
  const patientEmail = (formData.get("patientEmail") as string) || null;
  const modalidad = formData.get("modalidad") as "virtual" | "presencial" | null;

  if (!especialistaId || !startTime || !endTime || !reason || !patientName || !patientPhone) {
    throw new Error("Faltan campos requeridos");
  }
  if (modalidad !== "virtual" && modalidad !== "presencial") {
    throw new Error("La modalidad (virtual o presencial) es requerida");
  }
  if (endTime <= startTime) {
    throw new Error("Horario inválido");
  }

  // Re-verify slot is still available before saving
  const sameDayAppointments = await listAppointments({
    especialistaId,
    status: undefined,
    from: startTime.toISOString().slice(0, 10),
    to: startTime.toISOString().slice(0, 10),
  });
  const conflict = sameDayAppointments.some(
    (a) =>
      ["SCHEDULED", "RESCHEDULED"].includes(a.status) &&
      startTime < a.endTime &&
      endTime > a.startTime
  );
  if (conflict) {
    throw new Error("Este horario ya fue reservado. Por favor elige otro.");
  }

  // Reuse patient if same phone exists, otherwise create new
  let patient = await findPatientByPhone(patientPhone);
  if (!patient) {
    patient = await apiCreatePatient({ name: patientName, phone: patientPhone, email: patientEmail });
  }

  const appt = await apiCreateAppointment({
    especialistaId,
    patientId: patient.id,
    startTime,
    endTime,
    reason,
    modalidad,
  });

  revalidatePath("/panel/appointments");
  redirect(`/booking/confirmado?id=${appt.id}`);
};
