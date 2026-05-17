"use client";

import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "../../components/AuthGuard";
import { PlatformShell } from "../../components/PlatformShell";
import { FlashcardReviewer } from "../../components/FlashcardReviewer";
import { EmptyState } from "../../components/ui/EmptyState";
import { AreaSkeleton } from "../../components/skeletons/AreaSkeleton";
import { usePlatform } from "../../store/PlatformContext";
import { platformRoutes } from "../../routes";
import type { OwnerScope } from "../../types";

export function DeckStudy({ scope }: { scope: OwnerScope }) {
  return (
    <AuthGuard role={scope} fallback={<AreaSkeleton />}>
      <Inner scope={scope} />
    </AuthGuard>
  );
}

function Inner({ scope }: { scope: OwnerScope }) {
  const router = useRouter();
  const params = useParams<{ deckId: string }>();
  const deckId = params?.deckId as string;
  const { content, cardsByDeck } = usePlatform();

  const routes =
    scope === "professor" ? platformRoutes.professor : platformRoutes.aluno;
  const deck = content.decks.find((d) => d.id === deckId);
  const cards = cardsByDeck(deckId);

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
      title={`Estudando · ${deck.name}`}
      back={{ href: routes.deck(deck.id), label: deck.name }}
    >
      <FlashcardReviewer
        cards={cards}
        onDone={() => router.push(routes.deck(deck.id))}
      />
    </PlatformShell>
  );
}
