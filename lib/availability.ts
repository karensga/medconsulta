import { apiFetch } from "@/lib/api/client";

export type TimeSlot = {
  start: Date;
  end: Date;
  available: boolean;
};

// La API real calcula la disponibilidad del lado del servidor
// (GET /citas/disponibilidad?especialistaId&fecha&duracionMin), así que ya no
// recalculamos la grilla de horarios localmente contra Prisma.
//
// La colección Bruno no trae un ejemplo de la respuesta de este endpoint, así
// que este normalizador acepta varias formas plausibles:
//   - un array de strings ISO (horas de inicio disponibles)
//   - un array de objetos { inicio, fin?, disponible? }
//   - { slots: [...] } o { disponibilidad: [...] } envolviendo cualquiera de los anteriores
// Si la forma real difiere, este es el único lugar que hay que ajustar.
const normalizeSlots = (raw: unknown, durationMin: number): TimeSlot[] => {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { slots?: unknown[] })?.slots)
      ? (raw as { slots: unknown[] }).slots
      : Array.isArray((raw as { disponibilidad?: unknown[] })?.disponibilidad)
        ? (raw as { disponibilidad: unknown[] }).disponibilidad
        : [];

  return list.map((item) => {
    if (typeof item === "string") {
      const start = new Date(item);
      return { start, end: new Date(start.getTime() + durationMin * 60_000), available: true };
    }

    const obj = item as Record<string, unknown>;
    const startRaw = (obj.inicio ?? obj.start ?? obj.hora) as string;
    const start = new Date(startRaw);
    const endRaw = (obj.fin ?? obj.end) as string | undefined;
    const end = endRaw ? new Date(endRaw) : new Date(start.getTime() + durationMin * 60_000);
    const available =
      typeof obj.disponible === "boolean"
        ? obj.disponible
        : typeof obj.available === "boolean"
          ? obj.available
          : true;

    return { start, end, available };
  });
};

export const getAvailableSlots = async (
  especialistaId: string,
  date: Date,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<TimeSlot[]> => {
  const fecha = date.toISOString().slice(0, 10);
  const raw = await apiFetch<unknown>("/citas/disponibilidad", {
    searchParams: {
      especialistaId,
      fecha,
      duracionMin: durationMinutes,
    },
  });

  const slots = normalizeSlots(raw, durationMinutes);

  // La API no documenta un parámetro para excluir una cita propia al reagendar.
  // No podemos identificar aquí cuál slot corresponde a la cita excluida sin
  // conocerla de antemano, así que este caso se resuelve en la acción que llama
  // a esta función (ver app/actions/appointments.ts), reinsertando el horario
  // actual de la cita si no aparece en la lista.
  void excludeAppointmentId;

  return slots;
};

export const getAvailableDates = (weeksAhead = 3): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < weeksAhead * 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.getDay();
    // Skip sundays (0)
    if (day !== 0) dates.push(d);
  }
  return dates;
};
