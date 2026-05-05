import Link from "next/link";
import { aulasMock, cursosMock, modulosMock } from "@/lib/mock-data";

export default function CursosPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">Meus Cursos</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cursosMock.map((curso) => {
          const totalModulos = modulosMock.filter((m) => m.curso_id === curso.id).length;
          const firstLesson = aulasMock[0];
          return (
            <article key={curso.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-bold text-brandText">{curso.titulo}</h2>
              <p className="mt-2 text-sm text-slate-600">{curso.descricao}</p>
              <p className="mt-2 text-xs font-semibold text-brandBlue">{totalModulos} modulos disponiveis</p>
              <Link
                href={`/curso/${curso.id}/${firstLesson?.id ?? ""}`}
                className="mt-4 inline-flex rounded-full bg-brandRed px-4 py-2 text-sm font-semibold text-white"
              >
                Abrir curso
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
