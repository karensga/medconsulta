import AnimatedPage from "@/app/ui/AnimatedPage";

// Este wrapper solo se usa dentro de app/(app)/layout.tsx (el panel admin
// bajo /panel), que es lo único que renderiza <Sidebar>. /booking y /portal
// viven fuera de ese grupo de rutas y nunca pasan por acá.
export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:pl-60">
      <div className="h-14 md:hidden" />
      <AnimatedPage>{children}</AnimatedPage>
    </div>
  );
}
