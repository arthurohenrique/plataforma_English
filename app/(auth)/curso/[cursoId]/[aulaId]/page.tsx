import { notFound } from "next/navigation";
import { AulaWorkspace } from "@/components/plataforma/AulaWorkspace";
import { aulasMock, cursosMock, modulosMock, progressoMock } from "@/lib/mock-data";

type AulaPageProps = {
  params: Promise<{ cursoId: string; aulaId: string }>;
};

export default async function AulaPage({ params }: AulaPageProps) {
  const { cursoId, aulaId } = await params;

  const curso = cursosMock.find((item) => item.id === cursoId);
  const modulos = modulosMock.filter((item) => item.curso_id === cursoId);
  const aulas = aulasMock.filter((item) => modulos.some((modulo) => modulo.id === item.modulo_id));
  const aulaAtual = aulas.find((item) => item.id === aulaId);

  if (!curso || !aulaAtual) {
    notFound();
  }

  return <AulaWorkspace curso={curso} modulos={modulos} aulas={aulas} aulaAtual={aulaAtual} progressoInicial={progressoMock} />;
}
