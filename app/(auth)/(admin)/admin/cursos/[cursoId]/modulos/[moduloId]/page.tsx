type EditarModuloPageProps = {
  params: Promise<{ cursoId: string; moduloId: string }>;
};

export default async function EditarModuloPage({ params }: EditarModuloPageProps) {
  const { cursoId, moduloId } = await params;
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">
        Editar Modulo {moduloId} - Curso {cursoId}
      </h1>
      <p className="mt-3 text-sm text-slate-600">Base preparada para reordenacao com dnd-kit e persistencia em Supabase.</p>
    </main>
  );
}
