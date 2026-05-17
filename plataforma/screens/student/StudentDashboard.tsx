"use client";

import { usePlatform } from "../../store/PlatformContext";
import { PlatformShell } from "../../components/PlatformShell";
import { AuthGuard } from "../../components/AuthGuard";
import { AreaCard } from "../../components/AreaCard";
import { AREAS } from "../../areas";
import { platformRoutes } from "../../routes";
import { Tag } from "../../components/ui/Tag";
import { Icon } from "../../components/ui/Icon";
import { DashboardSkeleton } from "../../components/skeletons/DashboardSkeleton";

export function StudentDashboard() {
  return (
    <AuthGuard
      role="aluno"
      fallback={<DashboardSkeleton title="Áreas de estudo" />}
    >
      <PlatformShell title="Áreas de estudo">
        <Inner />
      </PlatformShell>
    </AuthGuard>
  );
}

function Inner() {
  const { auth, content } = usePlatform();

  const totalQuestions = content.questions.length;
  const correctCount = content.attempts.filter((a) => a.result === "correct").length;
  const watchedClasses = content.watchedCheckpointIds.length;

  return (
    <div className="p-fade-in">
      <header className="max-w-3xl">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-accent)]">
          Olá, {auth?.username}
        </p>
        <h1 className="mt-3 text-[36px] sm:text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">
          Vamos estudar
          <br />
          <span className="text-[color:var(--p-muted)]">de verdade?</span>
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[color:var(--p-muted)]">
          Escolha uma área para resolver os desafios criados pelo seu professor,
          ou continue de onde parou nas aulas gravadas.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Desafios disponíveis" value={String(totalQuestions)} />
        <StatCard
          label="Acertos"
          value={`${correctCount}/${totalQuestions}`}
        />
        <StatCard
          label="Aulas assistidas"
          value={`${watchedClasses}/${content.checkpoints.length}`}
        />
      </section>

      <h2 className="mt-12 text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Áreas
      </h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AREAS.map((a) => {
          const qs = content.questions.filter((q) => q.areaId === a.id);
          const done = qs.filter((q) =>
            content.attempts.some(
              (att) => att.questionId === q.id && att.result === "correct",
            ),
          ).length;
          return (
            <AreaCard
              key={a.id}
              area={a}
              href={platformRoutes.aluno.area(a.id)}
              meta={`${qs.length} ${qs.length === 1 ? "desafio" : "desafios"}`}
              progress={{ done, total: qs.length }}
            />
          );
        })}
      </div>

      <h2 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Aulas gravadas
      </h2>
      <a
        href={platformRoutes.aluno.aulas}
        className="mt-4 block p-card p-7 sm:p-8 transition-all hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
      >
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--p-accent-soft)] text-[color:var(--p-accent)]">
            <Icon name="play" size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[20px] font-semibold tracking-tight">
                Continue assistindo
              </h3>
              <Tag tone="accent">Cronologia oficial</Tag>
            </div>
            <p className="mt-1 text-[14px] text-[color:var(--p-muted)]">
              {content.checkpoints.length} aulas em ordem definida pelo professor.
              {watchedClasses > 0 && ` Você já assistiu ${watchedClasses}.`}
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
