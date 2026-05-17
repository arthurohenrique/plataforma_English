"use client";

import { useMemo, useState } from "react";
import type { Flashcard, Grade } from "../types";
import { usePlatform } from "../store/PlatformContext";
import { dueCards, previewNextInterval } from "../scheduler";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { EmptyState } from "./ui/EmptyState";

type Props = {
  cards: Flashcard[];
  onDone?: () => void;
};

export function FlashcardReviewer({ cards, onDone }: Props) {
  const { reviewFlashcard } = usePlatform();

  const queue = useMemo(() => dueCards(cards).map((c) => c.id), [cards]);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Resolve the current card from the latest "cards" prop so previews stay
  // in sync as the store mutates.
  const currentId = queue[position];
  const current = cards.find((c) => c.id === currentId);

  if (queue.length === 0 || !current) {
    return (
      <EmptyState
        icon="check"
        title="Tudo em dia."
        description="Não há cartas pendentes nesta sessão. Volte mais tarde — o sistema separará o que precisa revisar."
        action={
          onDone && (
            <Button variant="ghost" onClick={onDone}>
              Voltar
            </Button>
          )
        }
      />
    );
  }

  function grade(g: Grade) {
    reviewFlashcard(current!.id, g);
    setRevealed(false);
    setPosition((p) => p + 1);
  }

  const total = queue.length;
  const remaining = total - position;
  const progressPct = total > 0 ? ((position) / total) * 100 : 0;

  return (
    <div className="p-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[color:var(--p-surface)] overflow-hidden">
          <div
            className="h-full bg-[color:var(--p-accent)] transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[12px] font-medium text-[color:var(--p-muted)] shrink-0">
          {remaining} {remaining === 1 ? "carta" : "cartas"}
        </span>
      </div>

      {/* Card */}
      <div className="mt-6 sm:mt-8 mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="relative w-full text-left p-card p-6 sm:p-10 lg:p-12 min-h-[260px] sm:min-h-[320px] flex flex-col justify-center transition-all hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
          aria-label={revealed ? "Esconder resposta" : "Mostrar resposta"}
        >
          <span className="absolute top-4 sm:top-5 left-5 sm:left-7 text-[11px] uppercase tracking-[0.18em] font-semibold text-[color:var(--p-muted)]">
            {revealed ? "Resposta" : "Frente"}
          </span>

          <div className="text-center">
            <p className="text-[clamp(1.5rem,4.5vw,2.25rem)] leading-[1.15] font-semibold tracking-tight text-[color:var(--p-fg)] break-words">
              {current.front}
            </p>
            <div
              className={`grid transition-all duration-300 ease-out ${
                revealed
                  ? "grid-rows-[1fr] opacity-100 mt-6 sm:mt-8"
                  : "grid-rows-[0fr] opacity-0 mt-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="pt-6 border-t border-[color:var(--p-hairline)]">
                  <p className="text-[clamp(1.25rem,3.8vw,1.875rem)] leading-snug font-medium text-[color:var(--p-fg-soft)] break-words">
                    {current.back}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!revealed && (
            <span className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-[12px] text-[color:var(--p-muted)]">
              Tocar para ver a resposta
            </span>
          )}
        </button>

        {/* Grade buttons */}
        <div className="mt-5 sm:mt-6">
          {revealed ? (
            <div className="grid grid-cols-3 gap-2">
              <GradeButton
                onClick={() => grade("again")}
                label="Errei"
                next={previewNextInterval(current, "again")}
                tone="danger"
              />
              <GradeButton
                onClick={() => grade("good")}
                label="Acertei"
                next={previewNextInterval(current, "good")}
                tone="primary"
              />
              <GradeButton
                onClick={() => grade("easy")}
                label="Fácil"
                next={previewNextInterval(current, "easy")}
                tone="success"
              />
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={() => setRevealed(true)}
            >
              <Icon name="spark" size={14} />
              Mostrar resposta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function GradeButton({
  onClick,
  label,
  next,
  tone,
}: {
  onClick: () => void;
  label: string;
  next: string;
  tone: "danger" | "primary" | "success";
}) {
  const styles =
    tone === "danger"
      ? "border-[color:var(--p-hairline)] bg-white text-[color:var(--p-accent)] hover:bg-[color:var(--p-accent-soft)]"
      : tone === "primary"
        ? "border-[color:var(--p-fg)] bg-[color:var(--p-fg)] text-white hover:bg-[#0f2f4f]"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-3 sm:py-4 transition-all hover:-translate-y-[1px] ${styles}`}
    >
      <span className="text-[14px] sm:text-[15px] font-semibold tracking-tight">
        {label}
      </span>
      <span className="mt-1 text-[11px] opacity-70">+{next}</span>
    </button>
  );
}
