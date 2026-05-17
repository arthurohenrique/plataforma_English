"use client";

import { usePlatform } from "../../store/PlatformContext";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { CheckpointTimeline } from "../../components/CheckpointTimeline";
import { EmptyState } from "../../components/ui/EmptyState";
import { ClassesSkeleton } from "../../components/skeletons/ClassesSkeleton";

export function StudentClasses() {
  return (
    <AuthGuard
      role="aluno"
      fallback={<ClassesSkeleton title="Aulas gravadas" />}
    >
      <PlatformShell title="Aulas gravadas">
        <Inner />
      </PlatformShell>
    </AuthGuard>
  );
}

function Inner() {
  const { content } = usePlatform();
  return (
    <div className="p-fade-in">
      <header className="max-w-3xl">
        <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-accent)]">
          Cronologia oficial
        </p>
        <h1 className="mt-3 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
          Aulas gravadas.
        </h1>
        <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
          Siga a sequência definida pelo professor. Cada checkpoint constrói
          sobre o anterior.
        </p>
      </header>

      <section className="mt-8 sm:mt-10">
        {content.checkpoints.length === 0 ? (
          <EmptyState
            icon="film"
            title="Nenhuma aula publicada"
            description="O professor ainda não publicou checkpoints. Em breve."
          />
        ) : (
          <CheckpointTimeline checkpoints={content.checkpoints} mode="view" />
        )}
      </section>
    </div>
  );
}
