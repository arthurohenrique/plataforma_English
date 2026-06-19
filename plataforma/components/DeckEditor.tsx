"use client";

import { useState } from "react";
import type { Deck, OwnerScope } from "../types";
import { usePlatform, uid } from "../store/PlatformContext";
import { Button } from "./ui/Button";
import { Field, TextArea, TextInput } from "./ui/Input";
import { Tag } from "./ui/Tag";

const ACCENTS = ["#C8102E", "#0A2540", "#D4A017", "#1d4ed8", "#059669", "#7c3aed"];

export function DeckEditor({
  scope,
  existing,
  onDone,
}: {
  scope: OwnerScope;
  existing?: Deck;
  onDone?: () => void;
}) {
  const { upsertDeck, auth } = usePlatform();

  const [name, setName] = useState(existing?.name || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [accent, setAccent] = useState(existing?.accent || ACCENTS[0]);
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setErr(null);
    if (!name.trim()) {
      setErr("Dê um nome ao deck.");
      return;
    }
    const deck: Deck = {
      id: existing?.id || uid("d"),
      ownerScope: scope,
      ownerId: existing?.ownerId || auth?.userId || "",
      name: name.trim(),
      description: description.trim(),
      accent,
      createdAt: existing?.createdAt || Date.now(),
    };
    upsertDeck(deck);
    onDone?.();
  }

  return (
    <div className="p-card p-5 sm:p-7 lg:p-8 p-fade-in">
      <Tag tone="accent">{existing ? "Editar deck" : "Novo deck"}</Tag>
      <h3 className="mt-3 text-[18px] sm:text-[20px] font-semibold tracking-tight">
        Detalhes do deck
      </h3>

      <div className="mt-5 sm:mt-6 space-y-4">
        <Field label="Nome">
          <TextInput
            placeholder="Ex.: Verbos irregulares"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Descrição" hint="Opcional — explique o tema do deck">
          <TextArea
            rows={3}
            placeholder="Ex.: 60 verbos irregulares mais comuns em inglês"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div>
          <p className="text-[13px] font-medium text-[color:var(--p-fg)] mb-2">
            Cor de destaque
          </p>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccent(c)}
                aria-label={`Cor ${c}`}
                className={`h-9 w-9 rounded-full transition-all ${
                  accent === c
                    ? "ring-2 ring-offset-2 ring-[color:var(--p-fg)] scale-110"
                    : "hover:scale-105"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {err && (
        <p className="mt-4 text-[13px] text-[color:var(--p-accent)]">{err}</p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2">
        <Button onClick={save} className="w-full sm:w-auto">
          Salvar deck
        </Button>
        {onDone && (
          <Button variant="ghost" onClick={onDone} className="w-full sm:w-auto">
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
