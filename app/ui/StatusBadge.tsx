const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  SCHEDULED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Programada" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", label: "Completada" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "Cancelada" },
  RESCHEDULED: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Reagendada" },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = config[status] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}
