"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { rescheduleAppointment } from "@/app/actions/appointments";
import { SlotSkeleton } from "@/app/ui/Skeleton";

type Slot = { start: Date; end: Date };

export default function RescheduleForm({
  appointmentId,
  especialistaId,
  defaultDuration,
  availableDates,
}: {
  appointmentId: string;
  especialistaId: string;
  defaultDuration: number;
  availableDates: string[];
}) {
  const [duration, setDuration] = useState(defaultDuration);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchSlots = async (date: string, dur: number) => {
    if (!date) return;
    setLoadingSlots(true);
    setSlots(null);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `/api/slots?especialistaId=${especialistaId}&date=${date}&duration=${dur}&excludeId=${appointmentId}`
      );
      const data = await res.json();
      setSlots(
        data.slots
          .filter((s: { available: boolean }) => s.available)
          .map((s: { start: string; end: string }) => ({
            start: new Date(s.start),
            end: new Date(s.end),
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
    setSelectedSlot(null);
    fetchSlots(date, duration);
  };

  const handleDurationChange = (val: number) => {
    setDuration(val);
    setSelectedSlot(null);
    if (selectedDate) fetchSlots(selectedDate, val);
  };

  const handleSubmit = (formData: FormData) => {
    if (!selectedSlot) return;
    setError(null);
    formData.append("id", appointmentId);
    formData.append("startTime", selectedSlot.start.toISOString());
    formData.append("endTime", selectedSlot.end.toISOString());
    startTransition(async () => {
      try {
        await rescheduleAppointment(formData);
      } catch (e: unknown) {
        unstable_rethrow(e);
        if (e instanceof Error) setError(e.message);
      }
    });
  };

  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Duración */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duración (min)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={5}
            max={240}
            step={5}
            value={duration}
            onChange={(e) => handleDurationChange(Math.max(5, Number(e.target.value)))}
            className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {duration !== defaultDuration && (
            <button
              type="button"
              onClick={() => handleDurationChange(defaultDuration)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Restablecer ({defaultDuration} min)
            </button>
          )}
        </div>
      </div>

      {/* Fechas */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Nueva fecha</p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
          {availableDates.map((iso) => {
            const d = new Date(iso + "T12:00:00");
            const isSelected = selectedDate === iso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => handleDateChange(iso)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg border text-xs transition-colors ${
                  isSelected
                    ? "bg-yellow-500 text-white border-yellow-500"
                    : "bg-white text-gray-700 border-gray-200 hover:border-yellow-300"
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
          <p className="text-sm font-medium text-gray-700 mb-2">Nuevo horario</p>
          {loadingSlots ? (
            <SlotSkeleton />
          ) : !slots || slots.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center">
              No hay horarios disponibles para este día.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot, i) => {
                const isSelected = selectedSlot?.start.getTime() === slot.start.getTime();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                      isSelected
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-white text-gray-700 border-gray-200 hover:border-yellow-400"
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

      {/* Resumen + submit */}
      {selectedSlot && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 space-y-3">
          <p className="text-sm font-semibold text-yellow-800">
            {fmt(selectedSlot.start)} – {fmt(selectedSlot.end)} ·{" "}
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
              weekday: "long", day: "numeric", month: "long",
            })}
          </p>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Guardando..." : "Confirmar nuevo horario"}
          </button>
        </div>
      )}
    </form>
  );
}
