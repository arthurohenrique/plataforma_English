import Link from "next/link";

export default function AdminCursosPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serifTitle text-3xl text-brandBlue">Gerenciar Cursos</h1>
        <Link href="/admin/cursos/novo" className="rounded-full bg-brandRed px-4 py-2 text-sm font-semibold text-white">
          Novo Curso
        </Link>
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Estrutura inicial pronta para integrar CRUD com Supabase (cursos, modulos, aulas e ordenacao).
      </p>
    </main>
  );
}
