"use client";

import Link from "next/link";
import type { Deck, Flashcard } from "../types";
import { countDue } from "../scheduler";
import { Icon } from "./ui/Icon";
import { Tag } from "./ui/Tag";

export function DeckCard({
  deck,
  cards,
  href,
}: {
  deck: Deck;
  cards: Flashcard[];
  href: string;
}) {
  const due = countDue(cards);
  const total = cards.length;
  const reviewedAtLeastOnce = cards.filter((c) => c.lastReviewedAt).length;

  return (
    <Link
      href={href}
      className="group p-card p-5 sm:p-7 lg:p-8 flex flex-col transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-20px_rgba(10,37,64,0.18)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl"
          style={{
            background: `${deck.accent}14`,
            color: deck.accent,
          }}
        >
          <Icon name="book" size={20} />
        </div>
        {due > 0 ? (
          <Tag tone="accent">
            {due} {due === 1 ? "carta pronta" : "cartas prontas"}
          </Tag>
        ) : total > 0 ? (
          <Tag tone="success">Em dia</Tag>
        ) : (
          <Tag tone="neutral">Vazio</Tag>
        )}
      </div>

      <h3 className="mt-4 sm:mt-6 text-[18px] sm:text-[20px] font-semibold tracking-tight text-[color:var(--p-fg)] break-words">
        {deck.name}
      </h3>
      <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-[14px] leading-relaxed text-[color:var(--p-muted)] line-clamp-2">
        {deck.description || "Sem descrição."}
      </p>

      <div className="mt-5 sm:mt-6 flex items-center justify-between text-[12px] text-[color:var(--p-muted)]">
        <span>
          {total} {total === 1 ? "carta" : "cartas"}
        </span>
        {total > 0 && (
          <span>
            {Math.round((reviewedAtLeastOnce / total) * 100)}% iniciadas
          </span>
        )}
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[color:var(--p-fg)] group-hover:gap-2.5 transition-all">
        Abrir <Icon name="arrow-right" size={14} />
      </div>
    </Link>
  );
}
