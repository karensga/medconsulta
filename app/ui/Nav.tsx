"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/appointments", label: "Citas" },
  { href: "/doctors", label: "Especialistas" },
  { href: "/patients", label: "Pacientes" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/booking") || pathname === "/login") return null;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14">
        <span className="font-semibold text-blue-600 text-lg tracking-tight">
          MediAgenda
        </span>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-1 ml-6">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex ml-auto items-center gap-2">
          <Link
            href="/booking"
            target="_blank"
            className="px-3 py-1.5 rounded text-sm font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Vista paciente →
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Salir
            </button>
          </form>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden ml-auto p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {links.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-gray-100 flex gap-2">
            <Link
              href="/booking"
              target="_blank"
              onClick={() => setOpen(false)}
              className="flex-1 text-center px-3 py-2 rounded text-sm font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Vista paciente →
            </Link>
            <form action={logout} className="flex-1">
              <button
                type="submit"
                className="w-full px-3 py-2 rounded text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
