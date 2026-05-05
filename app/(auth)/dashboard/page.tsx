import Link from "next/link";
import { aulasMock, cursosMock, progressoMock } from "@/lib/mock-data";
import { ProgressBar } from "@/components/plataforma/ProgressBar";

export default function DashboardPage() {
  const totalAulas = aulasMock.length;
  const concluidas = progressoMock.filter((item) => item.assistida).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">Dashboard do Aluno</h1>
      <p className="mt-2 text-sm text-slate-600">Acompanhe seu progresso e retome suas videoaulas.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <ProgressBar current={concluidas} total={totalAulas} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cursosMock.map((curso) => (
          <article key={curso.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brandBlue">Curso ativo</p>
            <h2 className="mt-2 text-xl font-bold text-brandText">{curso.titulo}</h2>
            <p className="mt-2 text-sm text-slate-600">{curso.descricao}</p>
            <Link
              href={`/curso/${curso.id}/${aulasMock[0]?.id ?? ""}`}
              className="mt-4 inline-flex rounded-full bg-brandBlue px-4 py-2 text-sm font-semibold text-white"
            >
              Continuar estudando
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
