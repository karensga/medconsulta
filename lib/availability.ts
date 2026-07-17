import { prisma } from "@/lib/prisma";

export type TimeSlot = {
  start: Date;
  end: Date;
  available: boolean;
};

const parseTime = (timeStr: string, date: Date): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const getAvailableSlots = async (
  doctorId: string,
  date: Date,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<TimeSlot[]> => {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) return [];

  const dayStart = parseTime(doctor.workStart, date);
  const dayEnd = parseTime(doctor.workEnd, date);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      startTime: { gte: startOfDay, lte: endOfDay },
      status: { in: ["SCHEDULED", "RESCHEDULED"] },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
  });

  const slots: TimeSlot[] = [];
  const slotInterval = 15; // grid every 15 min
  let cursor = new Date(dayStart);

  while (true) {
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);
    if (slotEnd > dayEnd) break;

    const conflict = existingAppointments.some(
      (appt) => cursor < appt.endTime && slotEnd > appt.startTime
    );

    // Skip slots in the past
    const isPast = cursor <= new Date();

    slots.push({ start: new Date(cursor), end: slotEnd, available: !conflict && !isPast });
    cursor = new Date(cursor.getTime() + slotInterval * 60_000);
  }

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
