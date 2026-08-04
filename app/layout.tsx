import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nunki — Agenda para especialistas",
  description:
    "Agenda de citas, pacientes y videollamadas con Google Meet para consultorios de psicología.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geist.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        {children}
        <Toaster richColors position="bottom-right" closeButton />
      </body>
    </html>
  );
}
