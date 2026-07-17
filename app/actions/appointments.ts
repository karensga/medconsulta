"use server";

import { prisma } from "@/lib/prisma";
import {
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} from "@/lib/googleCalendar";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createAppointment = async (formData: FormData) => {
  const doctorId = formData.get("doctorId") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const reason = formData.get("reason") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!doctorId || !startTime || !endTime || !reason) {
    throw new Error("Faltan campos requeridos");
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

    const newPatient = await prisma.patient.create({
      data: {
        name: patientName,
        phone: patientPhone,
        email: patientEmail || undefined,
        documentId: patientDocument || undefined,
      },
    });
    patientId = newPatient.id;
  }

  const [doctor, patient] = await Promise.all([
    prisma.doctor.findUnique({ where: { id: doctorId } }),
    prisma.patient.findUnique({ where: { id: patientId } }),
  ]);

  const googleEventId = await createGoogleEvent({
    title: `${reason} — ${patient!.name}`,
    description: `Paciente: ${patient!.name} (${patient!.phone})\nDoctor: Dr. ${doctor!.name} (${doctor!.specialty})${notes ? `\nNotas: ${notes}` : ""}`,
    startTime,
    endTime,
    attendeeEmail: patient!.email,
  });

  await prisma.appointment.create({
    data: { doctorId, patientId, startTime, endTime, reason, notes, googleEventId },
  });

  revalidatePath("/appointments");
  redirect("/appointments?msg=appointment-created");
};

export const updateAppointmentStatus = async (
  id: string,
  status: string
) => {
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
};

export const rescheduleAppointment = async (formData: FormData) => {
  const id = formData.get("id") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);

  if (endTime <= startTime) {
    throw new Error("La hora de fin debe ser posterior a la hora de inicio");
  }

  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true, patient: true },
  });

  if (!appt) throw new Error("Cita no encontrada");

  if (appt.googleEventId) {
    await updateGoogleEvent(appt.googleEventId, {
      title: `${appt.reason} — ${appt.patient.name}`,
      description: `Paciente: ${appt.patient.name} (${appt.patient.phone})\nDoctor: Dr. ${appt.doctor.name} (${appt.doctor.specialty})`,
      startTime,
      endTime,
    });
  }

  await prisma.appointment.update({
    where: { id },
    data: { startTime, endTime, status: "RESCHEDULED" },
  });

  revalidatePath("/appointments");
  redirect("/appointments?msg=appointment-rescheduled");
};

export const deleteAppointment = async (id: string, _formData?: FormData) => {
  const appt = await prisma.appointment.findUnique({ where: { id } });

  if (appt?.googleEventId) {
    await deleteGoogleEvent(appt.googleEventId);
  }

  await prisma.appointment.delete({ where: { id } });
  revalidatePath("/appointments");
  redirect("/appointments?msg=appointment-deleted");
};
