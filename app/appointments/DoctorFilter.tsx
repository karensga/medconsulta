"use client";

import { useRouter } from "next/navigation";

export default function DoctorFilter({
  doctors,
  currentDoctorId,
}: {
  doctors: { id: string; name: string }[];
  currentDoctorId?: string;
}) {
  const router = useRouter();

  return (
    <select
      defaultValue={currentDoctorId ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        router.push(val ? `/appointments?doctorId=${val}` : "/appointments");
      }}
      className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
    >
      <option value="">Todos los doctores</option>
      {doctors.map((d) => (
        <option key={d.id} value={d.id}>
          Dr. {d.name}
        </option>
      ))}
    </select>
  );
}
