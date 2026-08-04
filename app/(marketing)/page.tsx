import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarClock,
  Video,
  Users,
  Stethoscope,
  Bell,
  ShieldCheck,
  ArrowRight,
  Mail,
} from "lucide-react";
import { ScrollReveal } from "@/app/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Nunki — Agenda online para consultorios de psicología",
  description:
    "Deja que tus pacientes reserven su cita en línea, con recordatorios y videollamada por Google Meet automática. Gestiona especialistas, pacientes y citas en un solo lugar.",
};

const CONTACT_EMAIL = "karennads10@gmail.com";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-both ease-[var(--ease-out)]">
            Hecho para consultorios de psicología
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 animate-in fade-in slide-in-from-bottom-8 duration-[700ms] delay-150 fill-mode-both ease-[var(--ease-out)]">
            La agenda de tu consultorio, sin llamadas ni WhatsApp de un lado a otro.
          </h1>
          <p className="mt-5 text-lg text-gray-600 animate-in fade-in slide-in-from-bottom-6 duration-600 delay-300 fill-mode-both ease-[var(--ease-out)]">
            Tus pacientes reservan su hora en línea a cualquier hora, reciben su enlace de
            videollamada automáticamente, y tú administras especialistas, pacientes y citas
            desde un solo panel.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[450ms] fill-mode-both ease-[var(--ease-out)]">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Quiero%20probar%20Nunki`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-[background-color,transform] duration-150 active:scale-[0.97]"
            >
              Solicitar acceso
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-[background-color,transform] duration-150 active:scale-[0.97]"
            >
              Ver la agenda de un paciente
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Todo lo que necesita tu consultorio
            </h2>
            <p className="mt-2 text-gray-600 max-w-xl">
              Pensado para el día a día de un equipo de especialistas: agenda, pacientes y
              videollamadas en un mismo lugar.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ScrollReveal delay={0}>
              <FeatureCard
                Icon={CalendarClock}
                title="Agenda pública 24/7"
                description="Tus pacientes eligen especialista, día y hora disponible desde un link que compartes tú — sin llamadas ni ida y vuelta por WhatsApp."
              />
            </ScrollReveal>
            <ScrollReveal delay={60}>
              <FeatureCard
                Icon={Video}
                title="Videollamada automática"
                description="Cada cita virtual crea su propio enlace de Google Meet al momento de agendarse, listo para compartir con el paciente."
              />
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <FeatureCard
                Icon={Stethoscope}
                title="Multi-especialista"
                description="Cada especialista tiene su propia jornada, duración de cita y agenda — ideal para consultorios con más de un profesional."
              />
            </ScrollReveal>
            <ScrollReveal delay={180}>
              <FeatureCard
                Icon={Users}
                title="Historial de pacientes"
                description="Datos de contacto, notas y antecedentes de cada paciente a la mano antes de cada sesión."
              />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <FeatureCard
                Icon={Bell}
                title="Estado de cada cita"
                description="Programada, reagendada, cancelada o completada — todo el equipo ve el mismo estado, en tiempo real."
              />
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <FeatureCard
                Icon={ShieldCheck}
                title="Acceso por roles"
                description="El equipo administrativo entra al panel con su cuenta; los pacientes solo ven su propia información."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Cómo funciona</h2>
        </ScrollReveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <ScrollReveal delay={0}>
            <Step
              number="1"
              title="Configura tu equipo"
              description="Registra a cada especialista con su horario y duración de cita habitual."
            />
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <Step
              number="2"
              title="Comparte tu link de reservas"
              description="Tus pacientes entran, eligen especialista y horario disponible, y confirman su cita."
            />
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <Step
              number="3"
              title="Atiende sin fricción"
              description="Llega el recordatorio, se genera el Meet si es virtual, y el equipo ve todo desde el panel."
            />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA final */}
      <section id="contacto" className="border-t border-gray-200 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            ¿Listo para digitalizar tu consultorio?
          </h2>
          <p className="mt-3 text-blue-100 max-w-xl mx-auto">
            Escríbenos y te ayudamos a configurar tu agenda con tus especialistas y horarios.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Quiero%20probar%20Nunki`}
            className="mt-7 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-[background-color,transform] duration-150 active:scale-[0.97]"
          >
            <Mail className="w-4 h-4" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  Icon,
  title,
  description,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="h-full rounded-xl border border-gray-200 p-5 transition-[border-color,box-shadow,transform] duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-600">{description}</p>
    </div>
  );
}
