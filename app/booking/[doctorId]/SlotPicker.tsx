"use client";

import { useState, useTransition } from "react";
import { createPublicAppointment } from "@/app/actions/booking";
import type { TimeSlot } from "@/lib/availability";
import { SlotSkeleton } from "@/app/ui/Skeleton";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  workStart: string;
  workEnd: string;
  slotDuration: number;
};

type Props = {
  doctor: Doctor;
  availableDates: string[];
};

export default function SlotPicker({ doctor, availableDates }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = async (date: string) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/slots?doctorId=${doctor.id}&date=${date}`);
      const data = await res.json();
      setSlots(
        data.slots.map((s: { start: string; end: string; available: boolean }) => ({
          start: new Date(s.start),
          end: new Date(s.end),
          available: s.available,
        }))
      );
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchSlots(date);
  };

  const handleSubmit = (formData: FormData) => {
    if (!selectedSlot) return;
    setError(null);
    formData.append("doctorId", doctor.id);
    formData.append("startTime", selectedSlot.start.toISOString());
    formData.append("endTime", selectedSlot.end.toISOString());
    startTransition(async () => {
      try {
        await createPublicAppointment(formData);
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message);
      }
    });
  };

  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const availableSlots = slots?.filter((s) => s.available) ?? [];

  return (
    <div className="space-y-6">
      {/* Fecha */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Selecciona una fecha</p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {availableDates.map((iso) => {
            const d = new Date(iso + "T12:00:00");
            const isSelected = selectedDate === iso;
            return (
              <button
                key={iso}
                onClick={() => handleDateChange(iso)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg border text-xs transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className="capitalize opacity-70">
                  {d.toLocaleDateString("es-ES", { weekday: "short" })}
                </span>
                <span className="text-base font-bold">{d.getDate()}</span>
                <span className="capitalize opacity-70">
                  {d.toLocaleDateString("es-ES", { month: "short" })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots */}
      {selectedDate && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Horarios disponibles
          </p>
          {loadingSlots ? (
            <SlotSkeleton />
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center">
              No hay horarios disponibles para este día.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot, i) => {
                const isSelected =
                  selectedSlot?.start.getTime() === slot.start.getTime();
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    {fmt(slot.start)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Formulario */}
      {selectedSlot && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <p className="text-sm font-semibold text-blue-800 mb-4">
            {fmt(selectedSlot.start)} – {fmt(selectedSlot.end)},{" "}
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>

          <form action={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tu nombre *
              </label>
              <input
                type="text"
                name="patientName"
                required
                placeholder="Ej: Juan Pérez"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="patientPhone"
                required
                placeholder="+56 9 1234 5678"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email (opcional)
              </label>
              <input
                type="email"
                name="patientEmail"
                placeholder="tu@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Motivo de consulta *
              </label>
              <input
                type="text"
                name="reason"
                required
                placeholder="Ej: Consulta general, revisión anual..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Reservando..." : "Confirmar reserva"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
