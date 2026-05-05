export default function NovoCursoPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">Criar Curso</h1>
      <form className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <input className="w-full rounded-lg border border-slate-300 p-3" placeholder="Titulo" />
        <textarea className="w-full rounded-lg border border-slate-300 p-3" placeholder="Descricao" />
        <select className="w-full rounded-lg border border-slate-300 p-3">
          <option value="basico">Basico</option>
          <option value="intermediario">Intermediario</option>
          <option value="avancado">Avancado</option>
          <option value="todos">Todos</option>
        </select>
        <button type="button" className="rounded-lg bg-brandBlue px-4 py-2 font-semibold text-white">
          Salvar Curso
        </button>
      </form>
    </main>
  );
}
