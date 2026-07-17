import { getAvailableSlots } from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const doctorId = searchParams.get("doctorId");
  const dateStr = searchParams.get("date");

  if (!doctorId || !dateStr) {
    return Response.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    return Response.json({ error: "Doctor no encontrado" }, { status: 404 });
  }

  const durationParam = searchParams.get("duration");
  const duration =
    durationParam && Number(durationParam) > 0
      ? Number(durationParam)
      : doctor.slotDuration;

  const excludeId = searchParams.get("excludeId") ?? undefined;
  const date = new Date(dateStr + "T12:00:00");
  const slots = await getAvailableSlots(doctorId, date, duration, excludeId);

  return Response.json({ slots });
};
