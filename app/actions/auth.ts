"use server";

import { timingSafeEqual } from "crypto";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type LoginState = { error: string } | null;

const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export const login = async (
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> => {
  const username = (formData.get("username") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";

  const adminUser = process.env.ADMIN_USERNAME ?? "";
  const adminPass = process.env.ADMIN_PASSWORD ?? "";

  if (!safeEqual(username, adminUser) || !safeEqual(password, adminPass)) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  await createSession();
  redirect("/appointments");
};

export const logout = async () => {
  await deleteSession();
  redirect("/login");
};
