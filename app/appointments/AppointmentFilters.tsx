"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

type Doctor = { id: string; name: string };

const ALL = "__all";

export default function AppointmentFilters({
  doctors,
  currentStatus,
  currentDoctorId,
  currentSearch,
  currentFrom,
  currentTo,
}: {
  doctors: Doctor[];
  currentStatus?: string;
  currentDoctorId?: string;
  currentSearch?: string;
  currentFrom?: string;
  currentTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch ?? "");

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(overrides)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      return `${pathname}?${params}`;
    },
    [searchParams, pathname]
  );

  const applySearch = () => {
    router.push(buildUrl({ search: search || undefined }));
  };

  const clearSearch = () => {
    setSearch("");
    router.push(buildUrl({ search: undefined }));
  };

  return (
    <div className="space-y-3">
      {/* Status + doctor filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <FilterChip href={buildUrl({ status: undefined })} active={!currentStatus} label="Todas" />
        <FilterChip href={buildUrl({ status: "SCHEDULED" })} active={currentStatus === "SCHEDULED"} label="Programadas" />
        <FilterChip href={buildUrl({ status: "COMPLETED" })} active={currentStatus === "COMPLETED"} label="Completadas" />
        <FilterChip href={buildUrl({ status: "CANCELLED" })} active={currentStatus === "CANCELLED"} label="Canceladas" />
        {doctors.length > 0 && (
          <Select
            value={currentDoctorId ?? ALL}
            onValueChange={(val) =>
              router.push(buildUrl({ doctorId: val && val !== ALL ? val : undefined }))
            }
          >
            <SelectTrigger className="h-7 rounded-full text-sm px-3">
              <SelectValue>
                {currentDoctorId && currentDoctorId !== ALL
                  ? `Dr. ${doctors.find((d) => d.id === currentDoctorId)?.name ?? ""}`
                  : "Todos los especialistas"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos los especialistas</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  Dr. {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Search + date range */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="Buscar paciente..."
            className="w-full pl-8 pr-8 py-1.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
          {search && (
            <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <DatePicker
          value={currentFrom}
          onChange={(val) => router.push(buildUrl({ from: val }))}
          placeholder="Desde"
          className="text-sm py-1.5"
        />
        <DatePicker
          value={currentTo}
          onChange={(val) => router.push(buildUrl({ to: val }))}
          placeholder="Hasta"
          className="text-sm py-1.5"
        />
        {(currentSearch || currentFrom || currentTo) && (
          <Link
            href={buildUrl({ search: undefined, from: undefined, to: undefined })}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Limpiar
          </Link>
        )}
      </div>
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
      }`}
    >
      {label}
    </Link>
  );
}
