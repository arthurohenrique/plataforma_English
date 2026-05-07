import Link from "next/link";
import { getStudentBiblioteca } from "@/lib/supabase/student-biblioteca";
import { notFound } from "next/navigation";

type ConteudoPageProps = {
  params: Promise<{ conteudoId: string }>;
};

export default async function ConteudoByIdPage({ params }: ConteudoPageProps) {
  const { conteudoId } = await params;
  const biblioteca = await getStudentBiblioteca();

  if (!biblioteca.aulas.length || conteudoId !== biblioteca.conteudo.id) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">{biblioteca.conteudo.titulo}</h1>
      <p className="mt-2 text-sm text-slate-600">{biblioteca.conteudo.descricao}</p>
      <p className="mt-2 text-xs font-semibold text-brandBlue">
        Cobertura curricular: {biblioteca.mapCoverage.mappedPercent}% ({biblioteca.mapCoverage.mappedPages}/
        {biblioteca.aulas.length})
      </p>
      <div className="mt-6 space-y-4">
        {biblioteca.sections.map((section) => (
          <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-brandText">{section.titulo}</h2>
            <p className="mt-2 text-sm text-slate-600">{section.units.length} unidades nesta secao.</p>

            <div className="mt-4 space-y-4">
              {section.units.map((unit) => (
                <article key={unit.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-brandBlue">{unit.titulo}</h3>
                  <p className="mt-1 text-xs text-slate-600">{unit.aulas.length} itens didaticos.</p>
                  <ul className="mt-3 space-y-2">
                    {unit.aulas.map((aula) => (
                      <li key={aula.id}>
                        <Link
                          href={`/biblioteca/${biblioteca.conteudo.id}/${aula.id}`}
                          className="inline-flex rounded-full border border-brandBlue px-4 py-1 text-sm font-semibold text-brandBlue"
                        >
                          {aula.itemTitle || aula.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

