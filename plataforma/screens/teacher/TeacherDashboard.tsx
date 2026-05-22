"use client";

import { usePlatform } from "../../store/PlatformContext";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { Tag } from "../../components/ui/Tag";
import { Button } from "../../components/ui/Button";
import { Icon, type IconName } from "../../components/ui/Icon";
import { platformRoutes } from "../../routes";
import { DashboardSkeleton } from "../../components/skeletons/DashboardSkeleton";
import { countDue } from "../../scheduler";

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
  const { auth, content, resetAllContent, decksByScope, cardsByDeck } =
    usePlatform();

  const totalMaterials = content.materials.length;
  const totalSections = content.materialSections.length;
  const totalCheckpoints = content.checkpoints.length;
  const myDecks = decksByScope("professor");
  const totalCardsDue = myDecks.reduce(
    (acc, d) => acc + countDue(cardsByDeck(d.id)),
    0,
  );

  return (
    <div className="p-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-accent)]">
            Olá, professor <span className="break-words">{auth?.username}</span>
          </p>
          <h1 className="mt-3 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            Construa a jornada
            <br />
            <span className="text-[color:var(--p-muted)]">dos seus alunos.</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
            Publique materiais para download, organize a cronologia das aulas
            gravadas e mantenha seus decks de flashcards.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="self-start lg:self-end"
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

      <section className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Materiais" value={String(totalMaterials)} />
        <StatCard label="Aulas" value={String(totalCheckpoints)} />
        <StatCard label="Decks" value={String(myDecks.length)} />
      </section>

      <h2 className="mt-10 sm:mt-12 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Materiais
      </h2>
      <ShortcutCard
        href={platformRoutes.professor.materiais}
        icon="folder"
        title="Gerenciar materiais"
        tags={
          <>
            <Tag tone="accent">
              {totalSections} {totalSections === 1 ? "seção" : "seções"}
            </Tag>
            <Tag tone="neutral">
              {totalMaterials} {totalMaterials === 1 ? "arquivo" : "arquivos"}
            </Tag>
          </>
        }
        description="Crie seções, anexe arquivos e defina a ordem em que aparecem para o aluno."
      />

      <h2 className="mt-10 sm:mt-12 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Flashcards
      </h2>
      <ShortcutCard
        href={platformRoutes.professor.flashcards}
        icon="book"
        title="Seus decks de flashcards"
        tags={
          <>
            <Tag tone="accent">
              {myDecks.length} {myDecks.length === 1 ? "deck" : "decks"}
            </Tag>
            {totalCardsDue > 0 && (
              <Tag tone="warning">{totalCardsDue} para revisar</Tag>
            )}
          </>
        }
        description="Crie e estude seus próprios decks. Ficam separados dos decks de alunos."
      />

      <h2 className="mt-10 sm:mt-12 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Aulas gravadas
      </h2>
      <ShortcutCard
        href={platformRoutes.professor.aulas}
        icon="film"
        title="Gerenciar cronologia"
        tags={
          <Tag tone="accent">
            {totalCheckpoints}{" "}
            {totalCheckpoints === 1 ? "checkpoint" : "checkpoints"}
          </Tag>
        }
        description="Crie checkpoints, reordene e anexe os vídeos da jornada do aluno."
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-card p-3 sm:p-5">
      <p className="text-[10px] sm:text-[12px] uppercase tracking-[0.14em] text-[color:var(--p-muted)] truncate">
        {label}
      </p>
      <p className="mt-1 sm:mt-2 text-[clamp(1.125rem,3.5vw,1.625rem)] font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
  tags,
}: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  tags?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="mt-4 block p-card p-5 sm:p-7 lg:p-8 transition-all hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
    >
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[color:var(--p-accent-soft)] text-[color:var(--p-accent)] shrink-0">
          <Icon name={icon} size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[17px] sm:text-[20px] font-semibold tracking-tight">
              {title}
            </h3>
            {tags}
          </div>
          <p className="mt-1 text-[13px] sm:text-[14px] text-[color:var(--p-muted)]">
            {description}
          </p>
        </div>
        <span className="text-[color:var(--p-muted)] shrink-0">
          <Icon name="chevron-right" size={18} />
        </span>
      </div>
    </a>
  );
}
