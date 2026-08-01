"use client";

import { usePathname } from "next/navigation";

export default function AnimatedPage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main
      key={pathname}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-3 duration-200 ease-[var(--ease-out)] fill-mode-both"
    >
      {children}
    </main>
  );
}
