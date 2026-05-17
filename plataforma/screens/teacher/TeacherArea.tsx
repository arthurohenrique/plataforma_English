"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { ExerciseEditor } from "../../components/ExerciseEditor";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { Tag } from "../../components/ui/Tag";
import { findArea } from "../../areas";
import { usePlatform } from "../../store/PlatformContext";
import { platformRoutes } from "../../routes";
import { Icon } from "../../components/ui/Icon";
import { AreaSkeleton } from "../../components/skeletons/AreaSkeleton";
import type { Question } from "../../types";

export function TeacherArea() {
  return (
    <AuthGuard role="professor" fallback={<AreaSkeleton />}>
      <Inner />
    </AuthGuard>
  );
}

function Inner() {
  const params = useParams<{ areaId: string }>();
  const areaId = params?.areaId as string;
  const area = findArea(areaId);
  const { content, removeQuestion } = usePlatform();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  const questions = useMemo(
    () =>
      content.questions
        .filter((q) => q.areaId === areaId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [content.questions, areaId],
  );

  if (!area) {
    return (
      <PlatformShell
        title="Área não encontrada"
        back={{ href: platformRoutes.professor.home, label: "Painel" }}
      >
        <EmptyState
          title="Área não encontrada"
          description="O link pode estar errado. Volte para o painel."
        />
      </PlatformShell>
    );
  }

  return (
    <PlatformShell
      title={`${area.title} · Gerenciar`}
      back={{ href: platformRoutes.professor.home, label: "Painel" }}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl min-w-0">
          <div
            className="inline-flex items-center justify-center rounded-2xl h-11 w-11 sm:h-12 sm:w-12"
            style={{
              background: `${area.accent}14`,
              color: area.accent,
            }}
          >
            <Icon name={area.icon} size={22} />
          </div>
          <h1 className="mt-4 sm:mt-5 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            {area.title}
          </h1>
          <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
            Crie e edite os desafios que aparecem para o aluno.
          </p>
        </div>

        {!creating && !editing && (
          <Button onClick={() => setCreating(true)} className="self-start sm:self-end">
            <Icon name="plus" size={14} />
            Nova questão
          </Button>
        )}
      </header>

      {(creating || editing) && (
        <section className="mt-8">
          <ExerciseEditor
            areaId={areaId}
            existing={editing || undefined}
            onDone={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </section>
      )}

      <section className="mt-10 space-y-3">
        {questions.length === 0 ? (
          <EmptyState
            icon="pencil"
            title="Nenhuma questão criada"
            description="Crie a primeira questão para esta área."
            action={
              !creating && (
                <Button onClick={() => setCreating(true)}>
                  Criar questão
                </Button>
              )
            }
          />
        ) : (
          questions.map((q) => (
            <div key={q.id} className="p-card p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag tone={q.kind === "multiple-choice" ? "accent" : "neutral"}>
                      {q.kind === "multiple-choice" ? "Múltipla escolha" : "Aberta"}
                    </Tag>
                  </div>
                  <h3 className="mt-3 text-[16px] sm:text-[17px] font-semibold tracking-tight break-words">
                    {q.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-[color:var(--p-muted)] line-clamp-2">
                    {q.statement}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(q);
                      setCreating(false);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Remover "${q.title}"?`)) removeQuestion(q.id);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </PlatformShell>
  );
}
