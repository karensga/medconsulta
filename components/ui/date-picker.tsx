"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

type Props = {
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({ value, onChange, placeholder = "Seleccionar fecha", className, disabled }: Props) {
  const [open, setOpen] = useState(false)

  const selected = value ? new Date(value + "T12:00:00") : undefined

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? date.toISOString().slice(0, 10) : undefined)
    setOpen(false)
  }

  const display = selected
    ? selected.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none",
          "hover:border-gray-400 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="w-4 h-4 shrink-0" />
        <span>{display}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
