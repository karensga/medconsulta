"use server";

import {
  createEspecialista as apiCreateEspecialista,
  updateEspecialista as apiUpdateEspecialista,
  deleteEspecialista as apiDeleteEspecialista,
} from "@/lib/api/especialistas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createEspecialista = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const specialty = formData.get("specialty") as string;
  const workStart = formData.get("workStart") as string;
  const workEnd = formData.get("workEnd") as string;
  const slotDuration = parseInt(formData.get("slotDuration") as string, 10) || 30;
  const email = (formData.get("email") as string) || null;
  const timeZone = (formData.get("timeZone") as string) || "";

  if (!name || !specialty || !workStart || !workEnd) {
    throw new Error("Faltan campos requeridos");
  }
  if (!timeZone) {
    throw new Error("La zona horaria es requerida");
  }

  await apiCreateEspecialista({ name, specialty, workStart, workEnd, slotDuration, email, timeZone });
  revalidatePath("/panel/especialistas");
  redirect("/panel/especialistas?msg=especialista-created");
};

export const updateEspecialista = async (id: string, formData: FormData) => {
  const name = formData.get("name") as string;
  const specialty = formData.get("specialty") as string;
  const workStart = formData.get("workStart") as string;
  const workEnd = formData.get("workEnd") as string;
  const slotDuration = parseInt(formData.get("slotDuration") as string, 10) || 30;
  const email = (formData.get("email") as string) || null;
  const timeZone = (formData.get("timeZone") as string) || "";

  if (!name || !specialty || !workStart || !workEnd) {
    throw new Error("Faltan campos requeridos");
  }
  if (!timeZone) {
    throw new Error("La zona horaria es requerida");
  }

  await apiUpdateEspecialista(id, { name, specialty, workStart, workEnd, slotDuration, email, timeZone });
  revalidatePath("/panel/especialistas");
  redirect("/panel/especialistas?msg=especialista-updated");
};

export const deleteEspecialista = async (id: string, _formData?: FormData) => {
  await apiDeleteEspecialista(id);
  revalidatePath("/panel/especialistas");
  redirect("/panel/especialistas?msg=especialista-deleted");
};
