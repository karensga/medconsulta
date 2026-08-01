"use client";

import { useTransition } from "react";
import { updateAppointmentStatus } from "@/app/actions/appointments";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// El back solo acepta estos tres estados. "Reagendada" no existe como estado:
// reprogramar es una acción aparte (cambia la hora, mantiene "Programada").
const statuses = [
  { value: "SCHEDULED", label: "Programada" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export default function StatusSelector({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={currentStatus}
      disabled={isPending}
      onValueChange={(newStatus) => {
        if (!newStatus) return;
        startTransition(async () => {
          await updateAppointmentStatus(appointmentId, newStatus);
          toast.success("Estado actualizado");
        });
      }}
    >
      <SelectTrigger className="text-sm h-8">
        <SelectValue>
          {statuses.find((s) => s.value === currentStatus)?.label ?? currentStatus}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
