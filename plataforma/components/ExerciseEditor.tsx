"use client";

import { useState } from "react";
import type { Question, QuestionKind } from "../types";
import { usePlatform, uid } from "../store/PlatformContext";
import { Button } from "./ui/Button";
import { Field, Select, TextArea, TextInput } from "./ui/Input";
import { Tag } from "./ui/Tag";

export function ExerciseEditor({
  areaId,
  existing,
  onDone,
}: {
  areaId: string;
  existing?: Question;
  onDone?: () => void;
}) {
  const { upsertQuestion } = usePlatform();

  const [title, setTitle] = useState(existing?.title || "");
  const [statement, setStatement] = useState(existing?.statement || "");
  const [kind, setKind] = useState<QuestionKind>(
    existing?.kind || "multiple-choice",
  );
  const [options, setOptions] = useState<string[]>(
    existing?.options || ["", "", "", ""],
  );
  const [correctIndex, setCorrectIndex] = useState<number>(
    existing?.correctIndex ?? 0,
  );
  const [expectedAnswer, setExpectedAnswer] = useState(
    existing?.expectedAnswer || "",
  );
  const [hint, setHint] = useState(existing?.hint || "");
  const [err, setErr] = useState<string | null>(null);

  function save() {
    setErr(null);
    if (!title.trim() || !statement.trim()) {
      setErr("Título e enunciado são obrigatórios.");
      return;
    }
    if (kind === "multiple-choice") {
      const filled = options.filter((o) => o.trim()).length;
      if (filled < 2) {
        setErr("Adicione ao menos duas opções.");
        return;
      }
      if (!options[correctIndex]?.trim()) {
        setErr("Selecione uma alternativa correta entre as opções preenchidas.");
        return;
      }
    } else if (!expectedAnswer.trim()) {
      setErr("Defina a resposta esperada para questões abertas.");
      return;
    }

    const q: Question = {
      id: existing?.id || uid("q"),
      areaId,
      title: title.trim(),
      statement: statement.trim(),
      kind,
      options: kind === "multiple-choice" ? options.map((o) => o.trim()) : undefined,
      correctIndex: kind === "multiple-choice" ? correctIndex : undefined,
      expectedAnswer: kind === "open" ? expectedAnswer.trim() : undefined,
      hint: hint.trim() || undefined,
      createdAt: existing?.createdAt || Date.now(),
    };

    upsertQuestion(q);
    onDone?.();
  }

  function setOption(i: number, v: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? v : o)));
  }

  return (
    <div className="p-card p-7 sm:p-8 p-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Tag tone="accent">
            {existing ? "Editar questão" : "Nova questão"}
          </Tag>
          <h3 className="mt-3 text-[20px] font-semibold tracking-tight">
            Conteúdo do desafio
          </h3>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Título">
          <TextInput
            placeholder="Ex.: Sinônimo de happy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Tipo">
          <Select
            value={kind}
            onChange={(e) => setKind(e.target.value as QuestionKind)}
          >
            <option value="multiple-choice">Múltipla escolha</option>
            <option value="open">Resposta aberta</option>
          </Select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Enunciado">
          <TextArea
            placeholder="Descreva o desafio para o aluno…"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
        </Field>
      </div>

      {kind === "multiple-choice" ? (
        <div className="mt-4">
          <p className="text-[13px] font-medium text-[color:var(--p-fg)]">
            Alternativas
          </p>
          <p className="text-[12px] text-[color:var(--p-muted)]">
            Marque o rádio à esquerda para indicar a alternativa correta.
          </p>
          <div className="mt-3 space-y-2">
            {options.map((opt, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${
                  correctIndex === i
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[color:var(--p-hairline)] bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                  className="h-4 w-4 accent-emerald-600"
                  aria-label={`Marcar opção ${i + 1} como correta`}
                />
                <TextInput
                  placeholder={`Opção ${i + 1}`}
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  className="!border-0 !ring-0 !p-2 !bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Field
            label="Resposta esperada"
            hint="Usada para verificação automática (case/acentos ignorados)."
          >
            <TextInput
              placeholder="Ex.: have lived"
              value={expectedAnswer}
              onChange={(e) => setExpectedAnswer(e.target.value)}
            />
          </Field>
        </div>
      )}

      <div className="mt-4">
        <Field label="Dica (opcional)">
          <TextInput
            placeholder="Uma pista útil para destravar o aluno"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
          />
        </Field>
      </div>

      {err && (
        <p className="mt-4 text-[13px] text-[color:var(--p-accent)]">{err}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={save}>Salvar questão</Button>
        {onDone && (
          <Button variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
