export default function AdminDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">Dashboard Admin</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total de alunos</p>
          <p className="mt-2 text-3xl font-bold text-brandBlue">32</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Cursos ativos</p>
          <p className="mt-2 text-3xl font-bold text-brandBlue">4</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Aulas publicadas</p>
          <p className="mt-2 text-3xl font-bold text-brandBlue">58</p>
        </article>
      </div>
    </main>
  );
}
