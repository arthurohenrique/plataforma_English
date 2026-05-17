import type { Flashcard, Grade } from "./types";

/**
 * Simplified Anki-style scheduler with 3 grades:
 *  - "again" → study again today (interval 0, repetitions reset)
 *  - "good"  → standard progression 1 → 3 → 7 → 14 → 30 → 60 days
 *  - "easy"  → accelerated progression 3 → 7 → 21 → 60 days
 *
 * The user said: "preciso de algo mais simples e facil" — so we avoid the
 * full SM-2 ease factor and use a fixed table for the first reps. Past the
 * table, we multiply by a constant factor.
 */
export function reschedule(card: Flashcard, grade: Grade, now: number = Date.now()): Flashcard {
  let { interval, repetitions } = card;

  if (grade === "again") {
    interval = 0;
    repetitions = 0;
  } else if (grade === "good") {
    repetitions += 1;
    interval = goodInterval(repetitions, interval);
  } else {
    // easy
    repetitions += 1;
    interval = easyInterval(repetitions, interval);
  }

  // Cards with interval 0 become due "now" (same session).
  const dueAt =
    interval === 0
      ? now
      : startOfDay(now) + interval * 86_400_000;

  return {
    ...card,
    interval,
    repetitions,
    dueAt,
    lastReviewedAt: now,
  };
}

function goodInterval(rep: number, prev: number): number {
  const table = [1, 3, 7, 14, 30];
  if (rep - 1 < table.length) return table[rep - 1];
  // beyond the table, ~2.2× the previous interval
  return Math.max(table[table.length - 1], Math.round(prev * 2.2));
}

function easyInterval(rep: number, prev: number): number {
  const table = [3, 7, 21];
  if (rep - 1 < table.length) return table[rep - 1];
  return Math.max(table[table.length - 1], Math.round(prev * 2.8));
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "due" cards = dueAt <= now */
export function isDue(card: Flashcard, now: number = Date.now()): boolean {
  return card.dueAt <= now;
}

/** Number of cards in a deck that are currently due. */
export function countDue(cards: Flashcard[], now: number = Date.now()): number {
  return cards.reduce((acc, c) => acc + (isDue(c, now) ? 1 : 0), 0);
}

/** Returns due cards sorted by oldest dueAt first (most overdue first). */
export function dueCards(cards: Flashcard[], now: number = Date.now()): Flashcard[] {
  return cards.filter((c) => isDue(c, now)).sort((a, b) => a.dueAt - b.dueAt);
}

/** Human-friendly preview of the next interval if the user picks `grade`. */
export function previewNextInterval(card: Flashcard, grade: Grade): string {
  const next = reschedule(card, grade);
  if (next.interval === 0) return "hoje";
  if (next.interval === 1) return "1 dia";
  if (next.interval < 30) return `${next.interval} dias`;
  if (next.interval < 60) return "1 mês";
  return `${Math.round(next.interval / 30)} meses`;
}
