"use client";

import { useRouter } from "next/navigation";

export default function EspecialistaFilter({
  especialistas,
  currentEspecialistaId,
}: {
  especialistas: { id: string; name: string }[];
  currentEspecialistaId?: string;
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={currentEspecialistaId ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        router.push(val ? `/panel/appointments?especialistaId=${val}` : "/panel/appointments");
      }}
      className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
    >
      <option value="">Todos los especialistas</option>
      {especialistas.map((d) => (
        <option key={d.id} value={d.id}>
          Dr. {d.name}
        </option>
      ))}
    </select>
  );
}
