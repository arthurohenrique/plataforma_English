"use client";

import { AREAS } from "../../areas";
import { usePlatform } from "../../store/PlatformContext";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { AreaCard } from "../../components/AreaCard";
import { Tag } from "../../components/ui/Tag";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { platformRoutes } from "../../routes";
import { DashboardSkeleton } from "../../components/skeletons/DashboardSkeleton";

export function TeacherDashboard() {
  return (
    <AuthGuard
      role="professor"
      fallback={<DashboardSkeleton title="Painel do professor" />}
    >
      <PlatformShell title="Painel do professor">
        <Inner />
      </PlatformShell>
    </AuthGuard>
  );
}

function Inner() {
  const { auth, content, resetAllContent } = usePlatform();

  const totalQuestions = content.questions.length;
  const totalCheckpoints = content.checkpoints.length;

  return (
    <div className="p-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-accent)]">
            Olá, professor {auth?.username}
          </p>
          <h1 className="mt-3 text-[36px] sm:text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">
            Construa a jornada
            <br />
            <span className="text-[color:var(--p-muted)]">dos seus alunos.</span>
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-[color:var(--p-muted)]">
            Crie desafios em cada área e organize a cronologia das aulas
            gravadas. Tudo o que você publicar aparece automaticamente para
            quem entrar como aluno.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (
              confirm(
                "Restaurar conteúdo de exemplo? Isso substitui o que você criou neste navegador.",
              )
            ) {
              resetAllContent();
            }
          }}
        >
          Restaurar seeds
        </Button>
      </header>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Áreas" value={String(AREAS.length)} />
        <StatCard label="Desafios criados" value={String(totalQuestions)} />
        <StatCard label="Aulas gravadas" value={String(totalCheckpoints)} />
      </section>

      <h2 className="mt-12 text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Áreas de estudo
      </h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AREAS.map((a) => {
          const count = content.questions.filter((q) => q.areaId === a.id).length;
          return (
            <AreaCard
              key={a.id}
              area={a}
              href={platformRoutes.professor.area(a.id)}
              meta={`${count} ${count === 1 ? "questão" : "questões"}`}
            />
          );
        })}
      </div>

      <h2 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Aulas gravadas
      </h2>
      <a
        href={platformRoutes.professor.aulas}
        className="mt-4 block p-card p-7 sm:p-8 transition-all hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
      >
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--p-accent-soft)] text-[color:var(--p-accent)]">
            <Icon name="film" size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[20px] font-semibold tracking-tight">
                Gerenciar cronologia
              </h3>
              <Tag tone="accent">
                {totalCheckpoints} {totalCheckpoints === 1 ? "checkpoint" : "checkpoints"}
              </Tag>
            </div>
            <p className="mt-1 text-[14px] text-[color:var(--p-muted)]">
              Crie checkpoints, reordene e anexe os vídeos da jornada do aluno.
            </p>
          </div>
          <span className="text-[color:var(--p-muted)]">
            <Icon name="chevron-right" size={18} />
          </span>
        </div>
      </a>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-card p-5">
      <p className="text-[12px] uppercase tracking-[0.14em] text-[color:var(--p-muted)]">
        {label}
      </p>
      <p className="mt-2 text-[26px] font-semibold tracking-tight">{value}</p>
    </div>
  );
}
