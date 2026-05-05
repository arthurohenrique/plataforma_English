type EditarCursoPageProps = {
  params: Promise<{ cursoId: string }>;
};

export default async function EditarCursoPage({ params }: EditarCursoPageProps) {
  const { cursoId } = await params;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">Editar Curso: {cursoId}</h1>
      <p className="mt-3 text-sm text-slate-600">Aqui sera conectada a edicao de curso com Supabase.</p>
    </main>
  );
}
