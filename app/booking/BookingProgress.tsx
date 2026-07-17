import { Check } from "lucide-react";

const steps = ["Especialista", "Fecha y hora", "Confirmado"];

export default function BookingProgress({ current }: { current: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < current
                  ? "bg-blue-600 text-white"
                  : i === current
                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={`text-sm hidden sm:block ${
                i === current ? "font-semibold text-gray-900" : i < current ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-3 h-px w-8 sm:w-12 shrink-0 ${i < current ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
