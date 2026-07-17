"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createDoctor = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const specialty = formData.get("specialty") as string;
  const workStart = formData.get("workStart") as string;
  const workEnd = formData.get("workEnd") as string;
  const slotDuration = parseInt(formData.get("slotDuration") as string, 10) || 30;

  if (!name || !specialty || !workStart || !workEnd) {
    throw new Error("Faltan campos requeridos");
  }

  await prisma.doctor.create({ data: { name, specialty, workStart, workEnd, slotDuration } });
  revalidatePath("/doctors");
  redirect("/doctors?msg=doctor-created");
};

export const deleteDoctor = async (id: string, _formData?: FormData) => {
  await prisma.doctor.delete({ where: { id } });
  revalidatePath("/doctors");
  redirect("/doctors?msg=doctor-deleted");
};
