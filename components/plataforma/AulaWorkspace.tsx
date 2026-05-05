"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/plataforma/Sidebar";
import { VideoPlayer } from "@/components/plataforma/VideoPlayer";
import { AulaInfo } from "@/components/plataforma/AulaInfo";
import type { Aula, Curso, Modulo, ProgressoAula } from "@/lib/types";

type AulaWorkspaceProps = {
  curso: Curso;
  modulos: Modulo[];
  aulas: Aula[];
  aulaAtual: Aula;
  progressoInicial: ProgressoAula[];
};

export function AulaWorkspace({ curso, modulos, aulas, aulaAtual, progressoInicial }: AulaWorkspaceProps) {
  const [progresso, setProgresso] = useState<ProgressoAula[]>(progressoInicial);

  const sortedAulas = useMemo(() => [...aulas].sort((a, b) => a.ordem - b.ordem), [aulas]);
  const currentIndex = sortedAulas.findIndex((item) => item.id === aulaAtual.id);
  const anterior = currentIndex > 0 ? sortedAulas[currentIndex - 1] : undefined;
  const proxima = currentIndex >= 0 && currentIndex < sortedAulas.length - 1 ? sortedAulas[currentIndex + 1] : undefined;

  function handleProgressSave(seconds: number, completed: boolean) {
    setProgresso((prev) => {
      const found = prev.find((item) => item.aula_id === aulaAtual.id);
      if (!found) {
        return [...prev, { aula_id: aulaAtual.id, assistida: completed, posicao_segundos: seconds }];
      }
      return prev.map((item) =>
        item.aula_id === aulaAtual.id
          ? { ...item, posicao_segundos: seconds, assistida: item.assistida || completed }
          : item,
      );
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
      <Sidebar cursos={[curso]} modulos={modulos} aulas={aulas} progresso={progresso} currentAulaId={aulaAtual.id} />
      <main className="flex-1 px-4 py-6 md:px-8">
        <VideoPlayer aula={aulaAtual} onProgressSave={handleProgressSave} />
        <AulaInfo aula={aulaAtual} anterior={anterior} proxima={proxima} cursoId={curso.id} />
      </main>
    </div>
  );
}
