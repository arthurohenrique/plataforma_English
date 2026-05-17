"use client";

import { useState } from "react";
import type { Checkpoint } from "../types";
import { usePlatform, uid } from "../store/PlatformContext";
import { Button } from "./ui/Button";
import { Field, TextArea, TextInput } from "./ui/Input";
import { Tag } from "./ui/Tag";

export function CheckpointEditor({
  existing,
  onDone,
}: {
  existing?: Checkpoint;
  onDone?: () => void;
}) {
  const { upsertCheckpoint, content } = usePlatform();

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl || "");
  const [durationMin, setDurationMin] = useState<string>(
    existing?.durationMin ? String(existing.durationMin) : "",
  );
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setErr(null);
    if (!title.trim() || !description.trim()) {
      setErr("Título e descrição são obrigatórios.");
      return;
    }
    const cp: Checkpoint = {
      id: existing?.id || uid("c"),
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      durationMin: durationMin.trim() ? Number(durationMin) : undefined,
      order: existing?.order ?? content.checkpoints.length,
      createdAt: existing?.createdAt || Date.now(),
    };
    upsertCheckpoint(cp);
    onDone?.();
  }

  return (
    <div className="p-card p-7 sm:p-8 p-fade-in">
      <Tag tone="accent">{existing ? "Editar checkpoint" : "Novo checkpoint"}</Tag>
      <h3 className="mt-3 text-[20px] font-semibold tracking-tight">
        Detalhes da aula
      </h3>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Título">
          <TextInput
            placeholder="Ex.: Aula 1 — Boas-vindas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Duração (minutos)" hint="Opcional">
          <TextInput
            type="number"
            inputMode="numeric"
            placeholder="20"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Descrição">
          <TextArea
            placeholder="O que será coberto nesta aula…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="URL do vídeo"
          hint="Cole link do YouTube, Vimeo, ou arquivo .mp4. Você pode deixar em branco e anexar depois."
        >
          <TextInput
            placeholder="https://www.youtube.com/watch?v=…"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </Field>
      </div>

      {err && (
        <p className="mt-4 text-[13px] text-[color:var(--p-accent)]">{err}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={save}>Salvar aula</Button>
        {onDone && (
          <Button variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
