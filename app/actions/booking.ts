"use server";

import { prisma } from "@/lib/prisma";
import { createGoogleEvent } from "@/lib/googleCalendar";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createPublicAppointment = async (formData: FormData) => {
  const doctorId = formData.get("doctorId") as string;
  const startTime = new Date(formData.get("startTime") as string);
  const endTime = new Date(formData.get("endTime") as string);
  const reason = formData.get("reason") as string;
  const patientName = formData.get("patientName") as string;
  const patientPhone = formData.get("patientPhone") as string;
  const patientEmail = (formData.get("patientEmail") as string) || null;

  if (!doctorId || !startTime || !endTime || !reason || !patientName || !patientPhone) {
    throw new Error("Faltan campos requeridos");
  }
  if (endTime <= startTime) {
    throw new Error("Horario inválido");
  }

  // Re-verify slot is still available before saving
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { in: ["SCHEDULED", "RESCHEDULED"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  if (conflict) {
    throw new Error("Este horario ya fue reservado. Por favor elige otro.");
  }

  // Reuse patient if same phone exists, otherwise create new
  let patient = await prisma.patient.findFirst({
    where: { phone: patientPhone },
  });
  if (!patient) {
    patient = await prisma.patient.create({
      data: { name: patientName, phone: patientPhone, email: patientEmail },
    });
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });

  const googleEventId = await createGoogleEvent({
    title: `${reason} — ${patient.name}`,
    description: `Paciente: ${patient.name} (${patient.phone})\nDoctor: Dr. ${doctor!.name} (${doctor!.specialty})`,
    startTime,
    endTime,
    attendeeEmail: patient.email,
  });

  const appt = await prisma.appointment.create({
    data: {
      doctorId,
      patientId: patient.id,
      startTime,
      endTime,
      reason,
      googleEventId,
    },
  });

  revalidatePath("/appointments");
  redirect(`/booking/confirmado?id=${appt.id}`);
};
