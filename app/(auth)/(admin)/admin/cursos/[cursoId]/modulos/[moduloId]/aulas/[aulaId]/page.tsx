type EditarAulaPageProps = {
  params: Promise<{ cursoId: string; moduloId: string; aulaId: string }>;
};

export default async function EditarAulaPage({ params }: EditarAulaPageProps) {
  const { cursoId, moduloId, aulaId } = await params;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <h1 className="font-serifTitle text-3xl text-brandBlue">
        Editar Aula {aulaId} - Curso {cursoId} / Modulo {moduloId}
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Estrutura pronta para preview de video, upload de materiais e status de publicacao.
      </p>
    </main>
  );
}
