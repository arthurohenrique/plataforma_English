"use client";

import { useState } from "react";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { DeckCard } from "../../components/DeckCard";
import { DeckEditor } from "../../components/DeckEditor";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { EmptyState } from "../../components/ui/EmptyState";
import { DashboardSkeleton } from "../../components/skeletons/DashboardSkeleton";
import { usePlatform } from "../../store/PlatformContext";
import { countDue } from "../../scheduler";
import { platformRoutes } from "../../routes";
import type { OwnerScope } from "../../types";

export function FlashcardsList({ scope }: { scope: OwnerScope }) {
  return (
    <AuthGuard
      role={scope}
      fallback={<DashboardSkeleton title="Flashcards" />}
    >
      <PlatformShell title="Flashcards">
        <Inner scope={scope} />
      </PlatformShell>
    </AuthGuard>
  );
}

function Inner({ scope }: { scope: OwnerScope }) {
  const { decksByScope, cardsByDeck, content } = usePlatform();
  const decks = decksByScope(scope);
  const [creating, setCreating] = useState(false);

  const routes =
    scope === "professor" ? platformRoutes.professor : platformRoutes.aluno;

  const totalCards = decks.reduce(
    (acc, d) => acc + cardsByDeck(d.id).length,
    0,
  );
  const totalDue = decks.reduce(
    (acc, d) => acc + countDue(cardsByDeck(d.id)),
    0,
  );

  return (
    <div className="p-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl min-w-0">
          <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-accent)]">
            Estudo espaçado
          </p>
          <h1 className="mt-3 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            Flashcards.
          </h1>
          <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
            {scope === "professor"
              ? "Crie seus próprios decks de flashcards. Eles ficam separados dos decks dos alunos."
              : "Crie seus decks de estudo. O sistema mostra cada carta de novo no momento certo para fixar o aprendizado."}
          </p>
        </div>

        {!creating && (
          <Button
            onClick={() => setCreating(true)}
            className="self-start sm:self-end"
          >
            <Icon name="plus" size={14} />
            Novo deck
          </Button>
        )}
      </header>

      {!creating && decks.length > 0 && (
        <section className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="Decks" value={String(decks.length)} />
          <Stat label="Cartas" value={String(totalCards)} />
          <Stat
            label="Para revisar"
            value={String(totalDue)}
            highlight={totalDue > 0}
          />
        </section>
      )}

      {creating && (
        <section className="mt-8">
          <DeckEditor scope={scope} onDone={() => setCreating(false)} />
        </section>
      )}

      <section className="mt-8 sm:mt-10">
        {decks.length === 0 ? (
          <EmptyState
            icon="book"
            title="Nenhum deck por aqui"
            description="Crie seu primeiro deck para começar a estudar."
            action={
              !creating && (
                <Button onClick={() => setCreating(true)}>Criar deck</Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {decks.map((d) => (
              <DeckCard
                key={d.id}
                deck={d}
                cards={cardsByDeck(d.id)}
                href={routes.deck(d.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-card p-3 sm:p-5 ${highlight ? "ring-1 ring-[color:var(--p-accent)]" : ""}`}
    >
      <p className="text-[10px] sm:text-[12px] uppercase tracking-[0.14em] text-[color:var(--p-muted)] truncate">
        {label}
      </p>
      <p
        className={`mt-1 sm:mt-2 text-[clamp(1.125rem,3.5vw,1.625rem)] font-semibold tracking-tight ${
          highlight ? "text-[color:var(--p-accent)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
