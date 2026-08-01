import { getEspecialista } from "@/lib/api/especialistas";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditEspecialistaForm from "./EditEspecialistaForm";

export default async function EditEspecialistaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const especialista = await getEspecialista(id);

  if (!especialista) notFound();

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/panel/especialistas" className="text-sm text-blue-600 hover:underline">
          ← Volver a especialistas
        </Link>
        <h1 className="text-2xl font-bold mt-2">Editar especialista</h1>
      </div>

      <EditEspecialistaForm especialista={especialista} />
    </div>
  );
}
