import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-blue-600 text-lg tracking-tight">
            Nunki
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#caracteristicas" className="hover:text-gray-900 transition-colors">
              Características
            </a>
            <a href="#como-funciona" className="hover:text-gray-900 transition-colors">
              Cómo funciona
            </a>
            <a href="#contacto" className="hover:text-gray-900 transition-colors">
              Contacto
            </a>
          </nav>
          <Link
            href="/auth/login?returnTo=/panel"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition active:scale-[0.97]"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Nunki. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            <a href="#contacto" className="hover:text-gray-700 transition-colors">
              Contacto
            </a>
            <Link href="/booking" className="hover:text-gray-700 transition-colors">
              Agenda de ejemplo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
