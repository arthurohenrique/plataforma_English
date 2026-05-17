"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { CardEditor } from "../../components/CardEditor";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { Tag } from "../../components/ui/Tag";
import { EmptyState } from "../../components/ui/EmptyState";
import { AreaSkeleton } from "../../components/skeletons/AreaSkeleton";
import { usePlatform } from "../../store/PlatformContext";
import { platformRoutes } from "../../routes";
import type { Flashcard, OwnerScope } from "../../types";

export function DeckCards({ scope }: { scope: OwnerScope }) {
  return (
    <AuthGuard role={scope} fallback={<AreaSkeleton />}>
      <Inner scope={scope} />
    </AuthGuard>
  );
}

function Inner({ scope }: { scope: OwnerScope }) {
  const params = useParams<{ deckId: string }>();
  const deckId = params?.deckId as string;
  const { content, cardsByDeck, removeFlashcard } = usePlatform();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Flashcard | null>(null);

  const routes =
    scope === "professor" ? platformRoutes.professor : platformRoutes.aluno;
  const deck = content.decks.find((d) => d.id === deckId);
  const cards = cardsByDeck(deckId).sort((a, b) => b.createdAt - a.createdAt);

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
      title={`${deck.name} · Cartas`}
      back={{ href: routes.deck(deck.id), label: deck.name }}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl min-w-0">
          <p className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--p-accent)]">
            {deck.name}
          </p>
          <h1 className="mt-3 text-[clamp(1.75rem,5.5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
            Cartas do deck
          </h1>
          <p className="mt-3 text-[14px] sm:text-[16px] leading-relaxed text-[color:var(--p-muted)]">
            Cada carta tem uma frente (pergunta) e um verso (resposta).
          </p>
          <div className="mt-3 sm:mt-4">
            <Tag tone="neutral">
              {cards.length} {cards.length === 1 ? "carta" : "cartas"}
            </Tag>
          </div>
        </div>

        {!creating && !editing && (
          <Button
            onClick={() => setCreating(true)}
            className="self-start sm:self-end"
          >
            <Icon name="plus" size={14} />
            Nova carta
          </Button>
        )}
      </header>

      {(creating || editing) && (
        <section className="mt-8">
          <CardEditor
            deckId={deck.id}
            existing={editing || undefined}
            onDone={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </section>
      )}

      <section className="mt-10 space-y-3 sm:space-y-4">
        {cards.length === 0 ? (
          <EmptyState
            icon="pencil"
            title="Nenhuma carta criada"
            description="Adicione a primeira carta para começar a estudar."
            action={
              !creating && (
                <Button onClick={() => setCreating(true)}>Criar carta</Button>
              )
            }
          />
        ) : (
          cards.map((c) => (
            <div key={c.id} className="p-card p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--p-muted)]">
                      Frente
                    </p>
                    <p className="mt-1 text-[15px] font-medium text-[color:var(--p-fg)] break-words">
                      {c.front}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--p-muted)]">
                      Verso
                    </p>
                    <p className="mt-1 text-[15px] text-[color:var(--p-fg)] break-words">
                      {c.back}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(c);
                      setCreating(false);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm("Remover esta carta?")) removeFlashcard(c.id);
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
