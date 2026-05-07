"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "@/components/plataforma/Sidebar";
import { VideoPlayer } from "@/components/plataforma/VideoPlayer";
import { AulaInfo } from "@/components/plataforma/AulaInfo";
import type { Aula, Conteudo, Modulo } from "@/lib/types";

type AulaWorkspaceProps = {
  conteudo: Conteudo;
  modulos: Modulo[];
  aulas: Aula[];
  aulaAtual: Aula;
};

export function AulaWorkspace({ conteudo, modulos, aulas, aulaAtual }: AulaWorkspaceProps) {
  const [, setTick] = useState(0);

  const sortedAulas = useMemo(() => [...aulas].sort((a, b) => a.ordem - b.ordem), [aulas]);
  const currentIndex = sortedAulas.findIndex((item) => item.id === aulaAtual.id);
  const anterior = currentIndex > 0 ? sortedAulas[currentIndex - 1] : undefined;
  const proxima = currentIndex >= 0 && currentIndex < sortedAulas.length - 1 ? sortedAulas[currentIndex + 1] : undefined;

  // Mantemos o callback para não quebrar o player, mas não persiste progresso.
  function handleProgressSave() {
    setTick((x) => x + 1);
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
      <Sidebar conteudos={[conteudo]} modulos={modulos} aulas={aulas} currentAulaId={aulaAtual.id} />
      <main className="flex-1 px-4 py-6 md:px-8">
        <VideoPlayer aula={aulaAtual} onProgressSave={handleProgressSave} />
        <AulaInfo aula={aulaAtual} anterior={anterior} proxima={proxima} conteudoId={conteudo.id} />
      </main>
    </div>
  );
}
