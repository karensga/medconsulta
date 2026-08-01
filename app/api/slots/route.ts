import { getAvailableSlots } from "@/lib/availability";
import { getEspecialista } from "@/lib/api/especialistas";
import { getAppointment } from "@/lib/api/appointments";
import { ApiError } from "@/lib/api/client";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const especialistaId = searchParams.get("especialistaId");
  const dateStr = searchParams.get("date");

  if (!especialistaId || !dateStr) {
    return Response.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  try {
    const especialista = await getEspecialista(especialistaId);
    if (!especialista) {
      return Response.json({ error: "Especialista no encontrado" }, { status: 404 });
    }

    const durationParam = searchParams.get("duration");
    const duration =
      durationParam && Number(durationParam) > 0
        ? Number(durationParam)
        : especialista.slotDuration;

    const excludeId = searchParams.get("excludeId") ?? undefined;
    const date = new Date(dateStr + "T12:00:00");
    let slots = await getAvailableSlots(especialistaId, date, duration, excludeId);

    // La API de disponibilidad no soporta excluir una cita propia (útil al
    // reagendar): si la cita excluida cae en la fecha consultada y su horario
    // actual no aparece en la lista, se reinserta como disponible.
    if (excludeId) {
      const current = await getAppointment(excludeId);
      if (current) {
        const sameDay = current.startTime.toDateString() === date.toDateString();
        const alreadyThere = slots.some((s) => s.start.getTime() === current.startTime.getTime());
        if (sameDay && !alreadyThere) {
          slots = [...slots, { start: current.startTime, end: current.endTime, available: true }].sort(
            (a, b) => a.start.getTime() - b.start.getTime()
          );
        }
      }
    }

    return Response.json({ slots });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error inesperado";
    const status = e instanceof ApiError ? e.status : 500;
    return Response.json({ error: message, slots: [] }, { status });
  }
};
