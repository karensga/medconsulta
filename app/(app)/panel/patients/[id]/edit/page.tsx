import { getPatient } from "@/lib/api/patients";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditPatientForm from "./EditPatientForm";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);

  if (!patient) notFound();

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/panel/patients" className="text-sm text-blue-600 hover:underline">
          ← Volver a pacientes
        </Link>
        <h1 className="text-2xl font-bold mt-2">Editar paciente</h1>
      </div>

      <EditPatientForm patient={patient} />
    </div>
  );
}
