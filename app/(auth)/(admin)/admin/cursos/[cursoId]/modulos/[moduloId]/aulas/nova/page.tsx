type NovaAulaPageProps = {
  params: Promise<{ cursoId: string; moduloId: string }>;
};

export default async function NovaAulaPage({ params }: NovaAulaPageProps) {
  const { cursoId, moduloId } = await params;
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">
        Nova Aula - Curso {cursoId} / Modulo {moduloId}
      </h1>
      <form className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <input className="w-full rounded-lg border border-slate-300 p-3" placeholder="Titulo da aula" />
        <textarea className="w-full rounded-lg border border-slate-300 p-3" placeholder="Descricao / objetivos" />
        <select className="w-full rounded-lg border border-slate-300 p-3">
          <option>youtube</option>
          <option>vimeo</option>
          <option>upload</option>
          <option>externo</option>
        </select>
        <input className="w-full rounded-lg border border-slate-300 p-3" placeholder="URL do video" />
        <button type="button" className="rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white">
          Salvar Aula
        </button>
      </form>
    </main>
  );
}
