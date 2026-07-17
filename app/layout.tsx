import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/app/ui/Sidebar";
import ContentWrapper from "@/app/ui/ContentWrapper";
import { Toaster } from "sonner";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clínica — Gestión de Citas",
  description: "Sistema de gestión de citas médicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geist.variable} h-full`} style={{ colorScheme: "light" }}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <Sidebar />
        <ContentWrapper>{children}</ContentWrapper>
        <Toaster richColors position="bottom-right" closeButton />
      </body>
    </html>
  );
}
