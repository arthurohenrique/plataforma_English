import Link from "next/link";
import { getStudentBiblioteca } from "@/lib/supabase/student-biblioteca";
import { notFound } from "next/navigation";

export default async function BibliotecaPage() {
  const biblioteca = await getStudentBiblioteca();

  if (!biblioteca.aulas.length) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">Biblioteca</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-brandText">{biblioteca.conteudo.titulo}</h2>
          <p className="mt-2 text-sm text-slate-600">{biblioteca.conteudo.descricao}</p>
          <p className="mt-2 text-xs font-semibold text-brandBlue">{biblioteca.modulos.length} modulos disponiveis</p>
          <Link
            href={`/biblioteca/${biblioteca.conteudo.id}/${biblioteca.aulas[0]?.id ?? ""}`}
            className="mt-4 inline-flex rounded-full bg-brandRed px-4 py-2 text-sm font-semibold text-white"
          >
            Abrir conteudo
          </Link>
        </article>
      </div>
    </main>
  );
}

