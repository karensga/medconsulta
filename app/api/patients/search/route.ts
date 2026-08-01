import { getPatientByDocument } from "@/lib/api/patients";
import { ApiError } from "@/lib/api/client";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const document = req.nextUrl.searchParams.get("document")?.trim();

  if (!document) {
    return Response.json({ patient: null });
  }

  try {
    const patient = await getPatientByDocument(document);
    return Response.json({ patient });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error inesperado";
    const status = e instanceof ApiError ? e.status : 500;
    return Response.json({ patient: null, error: message }, { status });
  }
};
