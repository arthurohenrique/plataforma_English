import Link from "next/link";
import { aulasMock, cursosMock, modulosMock } from "@/lib/mock-data";

type CursoPageProps = {
  params: Promise<{ cursoId: string }>;
};

export default async function CursoByIdPage({ params }: CursoPageProps) {
  const { cursoId } = await params;
  const curso = cursosMock.find((item) => item.id === cursoId) ?? cursosMock[0];
  const modulos = modulosMock.filter((item) => item.curso_id === curso.id);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">{curso.titulo}</h1>
      <p className="mt-2 text-sm text-slate-600">{curso.descricao}</p>
      <div className="mt-6 space-y-4">
        {modulos.map((modulo) => {
          const aulas = aulasMock.filter((item) => item.modulo_id === modulo.id);
          return (
            <section key={modulo.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-brandText">{modulo.titulo}</h2>
              <p className="mt-2 text-sm text-slate-600">{modulo.descricao}</p>
              <ul className="mt-4 space-y-2">
                {aulas.map((aula) => (
                  <li key={aula.id}>
                    <Link
                      href={`/curso/${curso.id}/${aula.id}`}
                      className="inline-flex rounded-full border border-brandBlue px-4 py-1 text-sm font-semibold text-brandBlue"
                    >
                      {aula.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
