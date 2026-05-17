"use client";

import { useMemo, useState } from "react";
import type { Checkpoint } from "../types";
import { usePlatform } from "../store/PlatformContext";
import { VideoEmbed } from "./VideoEmbed";
import { Button } from "./ui/Button";
import { Tag } from "./ui/Tag";
import { Icon } from "./ui/Icon";

export function CheckpointTimeline({
  checkpoints,
  mode,
}: {
  checkpoints: Checkpoint[];
  mode: "view" | "manage";
}) {
  const { content, markCheckpointWatched, reorderCheckpoint, removeCheckpoint } =
    usePlatform();
  const sorted = useMemo(
    () => [...checkpoints].sort((a, b) => a.order - b.order),
    [checkpoints],
  );

  const firstUnwatched = sorted.find(
    (c) => !content.watchedCheckpointIds.includes(c.id),
  )?.id;

  const [selectedId, setSelectedId] = useState<string | null>(
    sorted[0]?.id ?? null,
  );
  const selected = sorted.find((c) => c.id === selectedId) || sorted[0];

  if (sorted.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Timeline */}
      <ol className="lg:col-span-5 xl:col-span-4 p-card p-4 sm:p-5 space-y-1.5">
        {sorted.map((c, i) => {
          const watched = content.watchedCheckpointIds.includes(c.id);
          const next = mode === "view" && c.id === firstUnwatched;
          const isSel = selected?.id === c.id;
          return (
            <li key={c.id}>
              <button
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                  isSel
                    ? "border-[color:var(--p-fg)] bg-[color:var(--p-surface-2)]"
                    : "border-[color:var(--p-hairline)] bg-white hover:bg-[color:var(--p-surface-2)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      watched
                        ? "bg-emerald-500 text-white"
                        : next
                          ? "bg-[color:var(--p-accent)] text-white"
                          : "bg-[color:var(--p-surface)] text-[color:var(--p-muted)]"
                    }`}
                  >
                    {watched ? <Icon name="check" size={14} /> : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold tracking-tight text-[color:var(--p-fg)]">
                      {c.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] text-[color:var(--p-muted)]">
                      {c.durationMin ? `${c.durationMin} min` : "Aula"}
                      {next && <Tag tone="accent">Próxima</Tag>}
                      {watched && <Tag tone="success">Assistida</Tag>}
                    </p>
                  </div>

                  {mode === "manage" && (
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderCheckpoint(c.id, "up");
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-[color:var(--p-hairline)] bg-white text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)] disabled:opacity-40"
                        disabled={i === 0}
                        aria-label="Mover para cima"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderCheckpoint(c.id, "down");
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-[color:var(--p-hairline)] bg-white text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)] disabled:opacity-40"
                        disabled={i === sorted.length - 1}
                        aria-label="Mover para baixo"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Player + details */}
      <section className="lg:col-span-7 xl:col-span-8">
        {selected && (
          <div className="p-fade-in">
            <VideoEmbed url={selected.videoUrl} title={selected.title} />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <Tag tone="neutral">Aula {selected.order + 1}</Tag>
                <h3 className="mt-3 text-[22px] font-semibold tracking-tight">
                  {selected.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--p-muted)]">
                  {selected.description}
                </p>
              </div>
              {mode === "manage" && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Remover "${selected.title}"?`)) {
                      removeCheckpoint(selected.id);
                      setSelectedId(null);
                    }
                  }}
                >
                  Remover
                </Button>
              )}
            </div>

            {mode === "view" &&
              !content.watchedCheckpointIds.includes(selected.id) && (
                <div className="mt-6">
                  <Button onClick={() => markCheckpointWatched(selected.id)}>
                    Marcar como assistida
                  </Button>
                </div>
              )}
          </div>
        )}
      </section>
    </div>
  );
}
