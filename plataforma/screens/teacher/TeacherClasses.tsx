"use client";

import { useState } from "react";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { CheckpointTimeline } from "../../components/CheckpointTimeline";
import { CheckpointEditor } from "../../components/CheckpointEditor";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { Icon } from "../../components/ui/Icon";
import { ClassesSkeleton } from "../../components/skeletons/ClassesSkeleton";
import { usePlatform } from "../../store/PlatformContext";

export function TeacherClasses() {
  return (
    <AuthGuard
      role="professor"
      fallback={<ClassesSkeleton title="Aulas gravadas · Gerenciar" />}
    >
      <PlatformShell title="Aulas gravadas · Gerenciar">
        <Inner />
      </PlatformShell>
    </AuthGuard>
  );
}

function Inner() {
  const { content } = usePlatform();
  const [creating, setCreating] = useState(false);

  return (
    <div className="p-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl min-w-0">
          <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-accent)]">
            Cronologia
          </p>
          <h1 className="mt-3 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            Aulas gravadas.
          </h1>
          <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
            Crie checkpoints e organize a ordem em que o aluno deve assistir.
          </p>
          <div className="mt-3 sm:mt-4">
            <Tag tone="neutral">
              {content.checkpoints.length}{" "}
              {content.checkpoints.length === 1 ? "checkpoint" : "checkpoints"}
            </Tag>
          </div>
        </div>

        {!creating && (
          <Button onClick={() => setCreating(true)} className="self-start sm:self-end">
            <Icon name="plus" size={14} />
            Novo checkpoint
          </Button>
        )}
      </header>

      {creating && (
        <section className="mt-8">
          <CheckpointEditor onDone={() => setCreating(false)} />
        </section>
      )}

      <section className="mt-10">
        {content.checkpoints.length === 0 ? (
          <EmptyState
            icon="film"
            title="Nenhuma aula publicada"
            description="Crie o primeiro checkpoint para começar a cronologia."
            action={
              !creating && (
                <Button onClick={() => setCreating(true)}>
                  Criar checkpoint
                </Button>
              )
            }
          />
        ) : (
          <CheckpointTimeline checkpoints={content.checkpoints} mode="manage" />
        )}
      </section>
    </div>
  );
}
