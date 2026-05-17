"use client";

import { useState } from "react";
import type { Question } from "../types";
import { usePlatform } from "../store/PlatformContext";
import { Button } from "./ui/Button";
import { Tag } from "./ui/Tag";
import { TextArea } from "./ui/Input";
import { Icon } from "./ui/Icon";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function ExerciseRunner({ question }: { question: Question }) {
  const { recordAttempt, content } = usePlatform();
  const prior = content.attempts.find((a) => a.questionId === question.id);

  const [selected, setSelected] = useState<number | null>(null);
  const [openAnswer, setOpenAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<
    null | { ok: boolean; message: string }
  >(null);
  const [showHint, setShowHint] = useState(false);

  function check() {
    if (question.kind === "multiple-choice") {
      if (selected == null) return;
      const ok = selected === question.correctIndex;
      setFeedback({
        ok,
        message: ok
          ? "Resposta correta. Boa!"
          : "Resposta incorreta. Tente revisar e tentar novamente.",
      });
      recordAttempt(question.id, ok ? "correct" : "incorrect");
      return;
    }
    const expected = question.expectedAnswer || "";
    const ok =
      normalize(openAnswer).length > 0 &&
      normalize(openAnswer) === normalize(expected);
    setFeedback({
      ok,
      message: ok
        ? "Excelente! Resposta esperada."
        : "Não bateu exatamente. Veja a resposta sugerida ou tente reformular.",
    });
    recordAttempt(question.id, ok ? "correct" : "incorrect");
  }

  function reveal() {
    setRevealed(true);
    recordAttempt(question.id, "revealed");
  }

  function reset() {
    setSelected(null);
    setOpenAnswer("");
    setRevealed(false);
    setFeedback(null);
  }

  return (
    <article className="p-card p-7 sm:p-8 p-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-semibold tracking-tight text-[color:var(--p-fg)]">
            {question.title}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--p-muted)]">
            {question.statement}
          </p>
        </div>
        {prior && (
          <Tag
            tone={
              prior.result === "correct"
                ? "success"
                : prior.result === "incorrect"
                  ? "accent"
                  : "warning"
            }
          >
            {prior.result === "correct"
              ? "Resolvida"
              : prior.result === "incorrect"
                ? "Tentada"
                : "Revelada"}
          </Tag>
        )}
      </div>

      {question.kind === "multiple-choice" ? (
        <div className="mt-6 grid gap-2">
          {question.options?.map((opt, i) => {
            const isSel = selected === i;
            const isCorrect =
              feedback != null && i === question.correctIndex;
            const isWrongSel =
              feedback != null && isSel && i !== question.correctIndex;
            return (
              <label
                key={i}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-all ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : isWrongSel
                      ? "border-[color:var(--p-accent-soft)] bg-[color:var(--p-accent-soft)]"
                      : isSel
                        ? "border-[color:var(--p-fg)] bg-[color:var(--p-surface-2)]"
                        : "border-[color:var(--p-hairline)] bg-white hover:bg-[color:var(--p-surface-2)]"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={isSel}
                  onChange={() => setSelected(i)}
                  className="h-4 w-4 accent-[color:var(--p-fg)]"
                />
                <span className="text-[14px]">{opt}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mt-6">
          <TextArea
            placeholder="Escreva sua resposta…"
            value={openAnswer}
            onChange={(e) => setOpenAnswer(e.target.value)}
          />
          {revealed && question.expectedAnswer && (
            <div className="mt-3 rounded-2xl border border-[color:var(--p-hairline)] bg-[color:var(--p-surface-2)] p-4 text-[14px]">
              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[color:var(--p-muted)]">
                Resposta sugerida
              </p>
              <p className="mt-1 text-[color:var(--p-fg)]">
                {question.expectedAnswer}
              </p>
            </div>
          )}
        </div>
      )}

      {question.hint && (
        <div className="mt-4">
          <button
            onClick={() => setShowHint((v) => !v)}
            className="text-[12px] font-medium text-[color:var(--p-muted)] hover:text-[color:var(--p-fg)]"
          >
            {showHint ? "Ocultar dica" : "Mostrar dica"}
          </button>
          {showHint && (
            <p className="mt-2 inline-flex items-start gap-2 text-[13px] text-[color:var(--p-muted)]">
              <span className="mt-[1px] text-[color:var(--p-warning)]">
                <Icon name="lightbulb" size={14} />
              </span>
              <span>{question.hint}</span>
            </p>
          )}
        </div>
      )}

      {feedback && (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-[13px] ${
            feedback.ok
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-[color:var(--p-accent-soft)] text-[color:var(--p-accent)] border border-[color:var(--p-accent-soft)]"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button onClick={check}>Verificar</Button>
        {question.kind === "open" && (
          <Button variant="ghost" onClick={reveal}>
            Ver resposta
          </Button>
        )}
        <Button variant="ghost" onClick={reset}>
          Limpar
        </Button>
      </div>
    </article>
  );
}
