export default function AdminAlunosPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">Gerenciar Alunos</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cursos</th>
              <th className="px-4 py-3">Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-4 py-3">Aluno Exemplo</td>
              <td className="px-4 py-3">Ativo</td>
              <td className="px-4 py-3">English for Professionals</td>
              <td className="px-4 py-3">Matricular / Desativar / Ver progresso</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
