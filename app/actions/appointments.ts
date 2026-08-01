"use server";

import * as api from "@/lib/api/appointments";
import { createPatient as apiCreatePatient } from "@/lib/api/patients";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createAppointment = async (formData: FormData) => {
  const especialistaId = formData.get("especialistaId") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const reason = formData.get("reason") as string;
  const notes = (formData.get("notes") as string) || null;
  const modalidad = formData.get("modalidad") as "virtual" | "presencial" | null;

  if (!especialistaId || !startTime || !endTime || !reason) {
    throw new Error("Faltan campos requeridos");
  }
  if (modalidad !== "virtual" && modalidad !== "presencial") {
    throw new Error("La modalidad (virtual o presencial) es requerida");
  }
  if (endTime <= startTime) {
    throw new Error("La hora de fin debe ser posterior a la hora de inicio");
  }

  // Paciente existente o nuevo
  const existingPatientId = (formData.get("patientId") as string) || null;
  let patientId: string;

  if (existingPatientId) {
    patientId = existingPatientId;
  } else {
    const patientName = formData.get("patientName") as string;
    const patientPhone = formData.get("patientPhone") as string;
    const patientEmail = (formData.get("patientEmail") as string) || null;
    const patientDocument = (formData.get("patientDocument") as string) || null;

    if (!patientName || !patientPhone) {
      throw new Error("Nombre y teléfono del paciente son requeridos");
    }

    const newPatient = await apiCreatePatient({
      name: patientName,
      phone: patientPhone,
      email: patientEmail,
      documentId: patientDocument,
    });
    patientId = newPatient.id;
  }

  await api.createAppointment({ especialistaId, patientId, startTime, endTime, reason, notes, modalidad });

  revalidatePath("/panel/appointments");
  redirect("/panel/appointments?msg=appointment-created");
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  await api.updateAppointmentStatus(id, status);
  revalidatePath("/panel/appointments");
  revalidatePath(`/panel/appointments/`);
};

export const rescheduleAppointment = async (formData: FormData) => {
  const id = formData.get("id") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);

  if (endTime <= startTime) {
    throw new Error("La hora de fin debe ser posterior a la hora de inicio");
  }

  const appt = await api.getAppointment(id);
  if (!appt) throw new Error("Cita no encontrada");

  // El back no tiene estado "reprogramada": reprogramar solo cambia la hora
  // (PATCH /citas/:id re-valida jornada/solapamiento y re-sincroniza Google).
  // El estado se mantiene en "programada".
  await api.updateAppointmentTime(id, { startTime, endTime });

  revalidatePath("/panel/appointments");
  redirect("/panel/appointments?msg=appointment-rescheduled");
};

export const deleteAppointment = async (id: string, _formData?: FormData) => {
  await api.deleteAppointment(id);
  revalidatePath("/panel/appointments");
  redirect("/panel/appointments?msg=appointment-deleted");
};
