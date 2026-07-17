import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const document = req.nextUrl.searchParams.get("document")?.trim();

  if (!document) {
    return Response.json({ patient: null });
  }

  const patient = await prisma.patient.findFirst({
    where: { documentId: document },
    select: { id: true, name: true, phone: true, email: true, documentId: true },
  });

  return Response.json({ patient });
};
