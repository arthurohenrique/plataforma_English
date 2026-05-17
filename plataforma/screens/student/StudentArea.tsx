"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { ExerciseRunner } from "../../components/ExerciseRunner";
import { EmptyState } from "../../components/ui/EmptyState";
import { findArea } from "../../areas";
import { usePlatform } from "../../store/PlatformContext";
import { platformRoutes } from "../../routes";
import { Tag } from "../../components/ui/Tag";
import { Icon } from "../../components/ui/Icon";
import { AreaSkeleton } from "../../components/skeletons/AreaSkeleton";

export function StudentArea() {
  return (
    <AuthGuard role="aluno" fallback={<AreaSkeleton />}>
      <Inner />
    </AuthGuard>
  );
}

function Inner() {
  const params = useParams<{ areaId: string }>();
  const areaId = params?.areaId as string;
  const area = findArea(areaId);
  const { content } = usePlatform();

  const questions = useMemo(
    () => content.questions.filter((q) => q.areaId === areaId),
    [content.questions, areaId],
  );

  if (!area) {
    return (
      <PlatformShell
        title="Área não encontrada"
        back={{ href: platformRoutes.aluno.home, label: "Áreas" }}
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
      title={area.title}
      back={{ href: platformRoutes.aluno.home, label: "Áreas" }}
    >
      <header className="max-w-3xl">
        <div
          className="inline-flex items-center justify-center rounded-2xl h-12 w-12"
          style={{
            background: `${area.accent}14`,
            color: area.accent,
          }}
        >
          <Icon name={area.icon} size={22} />
        </div>
        <h1 className="mt-5 text-[36px] sm:text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">
          {area.title}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[color:var(--p-muted)]">
          {area.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag tone="neutral">
            {questions.length}{" "}
            {questions.length === 1 ? "desafio" : "desafios"}
          </Tag>
        </div>
      </header>

      <section className="mt-10 space-y-4">
        {questions.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Sem desafios por aqui ainda"
            description="O professor ainda não criou questões para esta área. Volte mais tarde."
          />
        ) : (
          questions.map((q) => <ExerciseRunner key={q.id} question={q} />)
        )}
      </section>
    </PlatformShell>
  );
}
