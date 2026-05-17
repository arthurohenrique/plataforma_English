"use client";

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";

const fieldBase =
  "w-full rounded-2xl border border-[color:var(--p-hairline)] bg-white px-4 py-3 text-[14px] text-[color:var(--p-fg)] placeholder:text-[color:var(--p-muted-2)] focus:outline-none focus:border-[color:var(--p-fg)] focus:ring-4 focus:ring-[color:var(--p-hairline)] transition-all";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[color:var(--p-fg)]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-[12px] text-[color:var(--p-accent)]">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-[color:var(--p-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${fieldBase} ${className}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", rows = 4, ...rest } = props;
  return (
    <textarea
      {...rest}
      rows={rows}
      className={`${fieldBase} resize-y leading-relaxed ${className}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select {...rest} className={`${fieldBase} pr-10 ${className}`}>
      {children}
    </select>
  );
}
