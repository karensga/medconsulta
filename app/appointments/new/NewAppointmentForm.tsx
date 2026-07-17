"use client";

import { useState, useTransition } from "react";
import { createAppointment } from "@/app/actions/appointments";
import { SlotSkeleton } from "@/app/ui/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Doctor = { id: string; name: string; specialty: string; slotDuration: number };
type FoundPatient = { id: string; name: string; phone: string; email: string | null; documentId: string | null };
type Slot = { start: Date; end: Date; available: boolean };

export default function NewAppointmentForm({
  doctors,
  availableDates,
}: {
  doctors: Doctor[];
  availableDates: string[];
}) {
  const [document, setDocument] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundPatient, setFoundPatient] = useState<FoundPatient | null>(null);

  const [doctorId, setDoctorId] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchPatient = async () => {
    if (!document.trim()) return;
    setSearching(true);
    setSearched(false);
    setFoundPatient(null);
    const res = await fetch(`/api/patients/search?document=${encodeURIComponent(document.trim())}`);
    const data = await res.json();
    setFoundPatient(data.patient ?? null);
    setSearched(true);
    setSearching(false);
  };

  const resetPatient = () => {
    setDocument("");
    setSearched(false);
    setFoundPatient(null);
  };

  const fetchSlots = async (dId: string, date: string, dur: number) => {
    if (!dId || !date) return;
    setLoadingSlots(true);
    setSlots(null);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/slots?doctorId=${dId}&date=${date}&duration=${dur}`);
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

  const handleDoctorChange = (id: string) => {
    const doc = doctors.find((d) => d.id === id);
    const defaultDuration = doc?.slotDuration ?? 30;
    setDoctorId(id);
    setDuration(defaultDuration);
    setSelectedDate("");
    setSlots(null);
    setSelectedSlot(null);
  };

  const handleDurationChange = (val: number) => {
    setDuration(val);
    setSelectedSlot(null);
    if (doctorId && selectedDate) fetchSlots(doctorId, selectedDate, val);
  };

  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots(null);
    if (!doctorId || !date) return;
    fetchSlots(doctorId, date, duration);
  };

  const handleSubmit = (formData: FormData) => {
    if (!selectedSlot) return;
    setError(null);
    formData.append("startTime", selectedSlot.start.toISOString());
    formData.append("endTime", selectedSlot.end.toISOString());
    startTransition(async () => {
      try {
        await createAppointment(formData);
      } catch (e: unknown) {
        if (e instanceof Error) setError(e.message);
      }
    });
  };

  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const availableSlots = slots?.filter((s) => s.available) ?? [];
  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  return (
    <form action={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* ── Columna izquierda: Paciente ── */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Paciente</h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={document}
            onChange={(e) => { setDocument(e.target.value); setSearched(false); setFoundPatient(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchPatient(); } }}
            placeholder="RUT, DNI, cédula..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={searchPatient}
            disabled={searching || !document.trim()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {searched && foundPatient && (
          <>
            <input type="hidden" name="patientId" value={foundPatient.id} />
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-start justify-between">
              <div className="text-sm">
                <p className="font-medium text-green-800">{foundPatient.name}</p>
                <p className="text-green-700 mt-0.5">
                  {foundPatient.phone}{foundPatient.email ? ` · ${foundPatient.email}` : ""}
                </p>
              </div>
              <button type="button" onClick={resetPatient} className="text-xs text-green-600 hover:text-green-800 underline ml-4 shrink-0">
                Cambiar
              </button>
            </div>
          </>
        )}

        {searched && !foundPatient && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center justify-between">
              <p className="text-sm text-amber-800">Paciente no encontrado. Completa los datos para registrarlo.</p>
              <button type="button" onClick={resetPatient} className="text-xs text-amber-700 hover:text-amber-900 underline ml-4 shrink-0">
                Limpiar
              </button>
            </div>
            <input type="hidden" name="patientDocument" value={document.trim()} />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
              <input name="patientName" required autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono *</label>
                <input name="patientPhone" required type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input name="patientEmail" type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Columna derecha: Detalles de la cita ── */}
      {searched ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">Detalles de la cita</h2>

          {/* Doctor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialista *</label>
            <Select name="doctorId" value={doctorId} onValueChange={(id) => id && handleDoctorChange(id)}>
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue>
                  {doctorId
                    ? (() => { const d = doctors.find((d) => d.id === doctorId); return d ? `Dr. ${d.name} — ${d.specialty}` : ""; })()
                    : "Seleccionar especialista..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    Dr. {d.name} — {d.specialty} ({d.slotDuration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duración */}
          {doctorId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración de esta cita (min)
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
                {selectedDoctor && duration !== selectedDoctor.slotDuration && (
                  <button
                    type="button"
                    onClick={() => handleDurationChange(selectedDoctor.slotDuration)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Restablecer ({selectedDoctor.slotDuration} min)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Fechas */}
          {doctorId && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Fecha</p>
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
          )}

          {/* Slots */}
          {selectedDate && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Horario disponible</p>
              {loadingSlots ? (
                <SlotSkeleton />
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg text-center">
                  No hay horarios disponibles para este día.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot, i) => {
                    const isSelected = selectedSlot?.start.getTime() === slot.start.getTime();
                    return (
                      <button
                        key={i}
                        type="button"
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

          {/* Resumen + motivo/notas */}
          {selectedSlot && selectedDoctor && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
              <p className="text-sm font-semibold text-blue-800">
                {fmt(selectedSlot.start)} – {fmt(selectedSlot.end)} ·{" "}
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-ES", {
                  weekday: "long", day: "numeric", month: "long",
                })}
                <span className="font-normal text-blue-600 ml-2">({duration} min)</span>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo *</label>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="Ej: Consulta general, revisión, urgencia..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Información adicional relevante..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
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
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Guardando..." : "Crear cita"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 min-h-48 text-sm text-gray-400 text-center p-6">
          Busca un paciente para continuar con los detalles de la cita
        </div>
      )}
    </form>
  );
}
