type NovoModuloPageProps = {
  params: Promise<{ cursoId: string }>;
};

export default async function NovoModuloPage({ params }: NovoModuloPageProps) {
  const { cursoId } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">Novo Modulo - Curso {cursoId}</h1>
      <form className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <input className="w-full rounded-lg border border-slate-300 p-3" placeholder="Titulo do modulo" />
        <textarea className="w-full rounded-lg border border-slate-300 p-3" placeholder="Descricao" />
        <input className="w-full rounded-lg border border-slate-300 p-3" placeholder="Tema / Capitulo" />
        <button type="button" className="rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white">
          Salvar Modulo
        </button>
      </form>
    </main>
  );
}
