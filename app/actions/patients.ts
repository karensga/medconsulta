"use server";

import {
  createPatient as apiCreatePatient,
  updatePatient as apiUpdatePatient,
  deletePatient as apiDeletePatient,
} from "@/lib/api/patients";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createPatient = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const documentId = (formData.get("documentId") as string) || null;

  if (!name || !phone) {
    throw new Error("Nombre y teléfono son requeridos");
  }

  await apiCreatePatient({ name, phone, email, notes, documentId });
  revalidatePath("/panel/patients");
  redirect("/panel/patients?msg=patient-created");
};

export const updatePatient = async (id: string, formData: FormData) => {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const documentId = (formData.get("documentId") as string) || null;

  if (!name || !phone) {
    throw new Error("Nombre y teléfono son requeridos");
  }

  await apiUpdatePatient(id, { name, phone, email, notes, documentId });
  revalidatePath("/panel/patients");
  redirect("/panel/patients?msg=patient-updated");
};

export const deletePatient = async (id: string, _formData?: FormData) => {
  await apiDeletePatient(id);
  revalidatePath("/panel/patients");
  redirect("/panel/patients?msg=patient-deleted");
};
