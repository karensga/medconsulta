"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createPatient = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!name || !phone) {
    throw new Error("Nombre y teléfono son requeridos");
  }

  await prisma.patient.create({ data: { name, phone, email, notes } });
  revalidatePath("/patients");
  redirect("/patients?msg=patient-created");
};

export const deletePatient = async (id: string, _formData?: FormData) => {
  await prisma.patient.delete({ where: { id } });
  revalidatePath("/patients");
  redirect("/patients?msg=patient-deleted");
};
