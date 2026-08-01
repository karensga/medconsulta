import Link from "next/link";
import NewEspecialistaForm from "./NewEspecialistaForm";

export default function NewEspecialistaPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/panel/especialistas" className="text-sm text-blue-600 hover:underline">
          ← Volver a especialistas
        </Link>
        <h1 className="text-2xl font-bold mt-2">Nuevo especialista</h1>
      </div>

      <NewEspecialistaForm />
    </div>
  );
}
