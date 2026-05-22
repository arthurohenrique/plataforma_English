"use client";

import { usePlatform } from "../../store/PlatformContext";
import { PlatformShell } from "../../components/PlatformShell";
import { AuthGuard } from "../../components/AuthGuard";
import { platformRoutes } from "../../routes";
import { Tag } from "../../components/ui/Tag";
import { Icon, type IconName } from "../../components/ui/Icon";
import { DashboardSkeleton } from "../../components/skeletons/DashboardSkeleton";
import { countDue } from "../../scheduler";

export function StudentDashboard() {
  return (
    <AuthGuard
      role="aluno"
      fallback={<DashboardSkeleton title="Painel do aluno" />}
    >
      <PlatformShell title="Painel do aluno">
        <Inner />
      </PlatformShell>
    </AuthGuard>
  );
}

function Inner() {
  const { auth, content, decksByScope, cardsByDeck } = usePlatform();

  const totalMaterials = content.materials.length;
  const totalSections = content.materialSections.length;
  const watchedClasses = content.watchedCheckpointIds.length;

  const myDecks = decksByScope("aluno");
  const totalCardsDue = myDecks.reduce(
    (acc, d) => acc + countDue(cardsByDeck(d.id)),
    0,
  );

  return (
    <div className="p-fade-in">
      <header className="max-w-3xl">
        <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-accent)]">
          Olá, <span className="break-words">{auth?.username}</span>
        </p>
        <h1 className="mt-3 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
          Vamos estudar
          <br />
          <span className="text-[color:var(--p-muted)]">de verdade?</span>
        </h1>
        <p className="mt-3 sm:mt-4 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
          Baixe os materiais que o professor publicou, continue de onde parou
          nas aulas gravadas e revise suas cartas.
        </p>
      </header>

      <section className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Materiais" value={String(totalMaterials)} />
        <StatCard
          label="Aulas"
          value={`${watchedClasses}/${content.checkpoints.length}`}
        />
        <StatCard label="Cartas hoje" value={String(totalCardsDue)} />
      </section>

      <h2 className="mt-10 sm:mt-12 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Materiais
      </h2>
      <ShortcutCard
        href={platformRoutes.aluno.materiais}
        icon="folder"
        title="Biblioteca de materiais"
        tags={
          totalMaterials > 0 ? (
            <Tag tone="accent">
              {totalSections} {totalSections === 1 ? "seção" : "seções"}
            </Tag>
          ) : null
        }
        description={
          totalMaterials === 0
            ? "Nenhum material publicado ainda."
            : `${totalMaterials} ${totalMaterials === 1 ? "arquivo" : "arquivos"} disponíveis para download.`
        }
      />

      <h2 className="mt-10 sm:mt-12 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Flashcards
      </h2>
      <ShortcutCard
        href={platformRoutes.aluno.flashcards}
        icon="book"
        title="Estudo espaçado"
        tags={
          totalCardsDue > 0 ? (
            <Tag tone="accent">{totalCardsDue} para revisar</Tag>
          ) : myDecks.length > 0 ? (
            <Tag tone="success">Em dia</Tag>
          ) : null
        }
        description={
          myDecks.length === 0
            ? "Crie seus decks de flashcards para fixar vocabulário."
            : `${myDecks.length} ${myDecks.length === 1 ? "deck criado" : "decks criados"}.`
        }
      />

      <h2 className="mt-10 sm:mt-12 text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-muted)]">
        Aulas gravadas
      </h2>
      <ShortcutCard
        href={platformRoutes.aluno.aulas}
        icon="play"
        title="Continue assistindo"
        tags={<Tag tone="accent">Cronologia oficial</Tag>}
        description={
          `${content.checkpoints.length} aulas em ordem definida pelo professor.` +
          (watchedClasses > 0 ? ` Você já assistiu ${watchedClasses}.` : "")
        }
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
