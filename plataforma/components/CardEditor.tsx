"use client";

import { useState } from "react";
import type { Flashcard } from "../types";
import { usePlatform, uid } from "../store/PlatformContext";
import { Button } from "./ui/Button";
import { Field, TextArea } from "./ui/Input";
import { Tag } from "./ui/Tag";

export function CardEditor({
  deckId,
  existing,
  onDone,
}: {
  deckId: string;
  existing?: Flashcard;
  onDone?: () => void;
}) {
  const { upsertFlashcard } = usePlatform();

  const [front, setFront] = useState(existing?.front || "");
  const [back, setBack] = useState(existing?.back || "");
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setErr(null);
    if (!front.trim() || !back.trim()) {
      setErr("Preencha frente e verso da carta.");
      return;
    }
    const card: Flashcard = existing
      ? { ...existing, front: front.trim(), back: back.trim() }
      : {
          id: uid("fc"),
          deckId,
          front: front.trim(),
          back: back.trim(),
          interval: 0,
          repetitions: 0,
          dueAt: Date.now(),
          lastReviewedAt: null,
          createdAt: Date.now(),
        };
    upsertFlashcard(card);
    if (!existing) {
      setFront("");
      setBack("");
    } else {
      onDone?.();
    }
  }

  return (
    <div className="p-card p-5 sm:p-7 p-fade-in">
      <Tag tone="accent">{existing ? "Editar carta" : "Nova carta"}</Tag>
      <div className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Frente" hint="O que vai aparecer primeiro">
          <TextArea
            rows={3}
            placeholder="Ex.: to bring"
            value={front}
            onChange={(e) => setFront(e.target.value)}
          />
        </Field>
        <Field label="Verso" hint="A resposta / tradução / definição">
          <TextArea
            rows={3}
            placeholder="Ex.: trazer"
            value={back}
            onChange={(e) => setBack(e.target.value)}
          />
        </Field>
      </div>

      {err && (
        <p className="mt-4 text-[13px] text-[color:var(--p-accent)]">{err}</p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2">
        <Button onClick={save} className="w-full sm:w-auto">
          {existing ? "Salvar carta" : "Adicionar carta"}
        </Button>
        {onDone && (
          <Button variant="ghost" onClick={onDone} className="w-full sm:w-auto">
            {existing ? "Cancelar" : "Concluir"}
          </Button>
        )}
      </div>
    </div>
  );
}
