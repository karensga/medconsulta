import Link from "next/link";
import NewPatientForm from "./NewPatientForm";

export default function NewPatientPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/panel/patients" className="text-sm text-blue-600 hover:underline">
          ← Volver a pacientes
        </Link>
        <h1 className="text-2xl font-bold mt-2">Nuevo paciente</h1>
      </div>

      <NewPatientForm />
    </div>
  );
}
