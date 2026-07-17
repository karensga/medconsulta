"use client";

import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasSidebar = !pathname.startsWith("/booking") && pathname !== "/login";

  return (
    <div className={hasSidebar ? "md:pl-60" : ""}>
      {hasSidebar && <div className="h-14 md:hidden" />}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
