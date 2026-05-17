"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { DeckEditor } from "../../components/DeckEditor";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { Tag } from "../../components/ui/Tag";
import { EmptyState } from "../../components/ui/EmptyState";
import { DashboardSkeleton } from "../../components/skeletons/DashboardSkeleton";
import { usePlatform } from "../../store/PlatformContext";
import { countDue } from "../../scheduler";
import { platformRoutes } from "../../routes";
import type { OwnerScope } from "../../types";

export function DeckOverview({ scope }: { scope: OwnerScope }) {
  return (
    <AuthGuard
      role={scope}
      fallback={<DashboardSkeleton title="Deck" />}
    >
      <Inner scope={scope} />
    </AuthGuard>
  );
}

function Inner({ scope }: { scope: OwnerScope }) {
  const params = useParams<{ deckId: string }>();
  const deckId = params?.deckId as string;
  const { content, cardsByDeck, removeDeck } = usePlatform();
  const [editing, setEditing] = useState(false);

  const routes =
    scope === "professor" ? platformRoutes.professor : platformRoutes.aluno;
  const deck = content.decks.find((d) => d.id === deckId);
  const cards = cardsByDeck(deckId);
  const due = countDue(cards);

  if (!deck || deck.ownerScope !== scope) {
    return (
      <PlatformShell
        title="Deck não encontrado"
        back={{ href: routes.flashcards, label: "Flashcards" }}
      >
        <EmptyState
          title="Deck não encontrado"
          description="O deck pode ter sido removido ou pertence a outro perfil."
        />
      </PlatformShell>
    );
  }

  return (
    <PlatformShell
      title={deck.name}
      back={{ href: routes.flashcards, label: "Flashcards" }}
    >
      <div className="p-fade-in">
        <header className="max-w-3xl">
          <div
            className="inline-flex items-center justify-center rounded-2xl h-11 w-11 sm:h-12 sm:w-12"
            style={{ background: `${deck.accent}14`, color: deck.accent }}
          >
            <Icon name="book" size={22} />
          </div>
          <h1 className="mt-4 sm:mt-5 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em] break-words">
            {deck.name}
          </h1>
          {deck.description && (
            <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
              {deck.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Tag tone="neutral">
              {cards.length} {cards.length === 1 ? "carta" : "cartas"}
            </Tag>
            {due > 0 ? (
              <Tag tone="accent">{due} para revisar</Tag>
            ) : cards.length > 0 ? (
              <Tag tone="success">Em dia</Tag>
            ) : null}
          </div>
        </header>

        <section className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={routes.deckStudy(deck.id)}
            className={`p-card p-6 sm:p-7 lg:p-8 transition-all hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)] ${
              cards.length === 0 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--p-accent-soft)] text-[color:var(--p-accent)]"
            >
              <Icon name="spark" size={22} />
            </div>
            <h3 className="mt-5 sm:mt-6 text-[18px] sm:text-[20px] font-semibold tracking-tight">
              Estudar agora
            </h3>
            <p className="mt-2 text-[13px] sm:text-[14px] text-[color:var(--p-muted)]">
              {cards.length === 0
                ? "Adicione cartas para começar."
                : due > 0
                  ? `${due} ${due === 1 ? "carta pronta" : "cartas prontas"} para revisão.`
                  : "Nada vencido — você está em dia."}
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium">
              Iniciar sessão <Icon name="arrow-right" size={14} />
            </div>
          </Link>

          <Link
            href={routes.deckCards(deck.id)}
            className="p-card p-6 sm:p-7 lg:p-8 transition-all hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--p-surface)] text-[color:var(--p-fg)]">
              <Icon name="pencil" size={22} />
            </div>
            <h3 className="mt-5 sm:mt-6 text-[18px] sm:text-[20px] font-semibold tracking-tight">
              Gerenciar cartas
            </h3>
            <p className="mt-2 text-[13px] sm:text-[14px] text-[color:var(--p-muted)]">
              Adicione, edite ou remova cartas deste deck.
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium">
              Abrir <Icon name="arrow-right" size={14} />
            </div>
          </Link>
        </section>

        <section className="mt-10 sm:mt-12">
          {editing ? (
            <DeckEditor
              scope={scope}
              existing={deck}
              onDone={() => setEditing(false)}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setEditing(true)}>
                Editar deck
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (
                    confirm(
                      `Remover o deck "${deck.name}"? Todas as cartas dele também serão apagadas.`,
                    )
                  ) {
                    removeDeck(deck.id);
                    window.location.href = routes.flashcards;
                  }
                }}
              >
                Remover deck
              </Button>
            </div>
          )}
        </section>
      </div>
    </PlatformShell>
  );
}
