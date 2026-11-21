import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export function parseWholeNumber(value: string): number | undefined {
  const text = value.trim();
  if (!/^[+-]?\d+$/.test(text)) return undefined;
  const parsed = Number(text);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("de-DE");
}

type NumberFieldProps = {
  label: string;
  value: number;
  onCommit: (value: number) => boolean;
  bounds?: { min?: number; max?: number };
  step?: number;
  steps?: boolean;
  signed?: boolean;
  getCost?: (value: number) => number | undefined;
};

export function NumberField({
  label,
  value,
  onCommit,
  bounds,
  step = 1,
  steps = true,
  signed = false,
  getCost,
}: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const cancel = useRef(false);
  const parsed = draft === null ? undefined : parseWholeNumber(draft);
  const cost = parsed === undefined || parsed === value ? undefined : getCost?.(parsed);
  const hint = error
    ? error
    : cost === undefined
      ? ""
      : cost < 0
        ? `+${formatNumber(-cost)} SP Rückerstattung`
        : `${formatNumber(cost)} SP Kosten`;

  function commitDraft() {
    setDraft(null);
    if (cancel.current || draft === null) {
      cancel.current = false;
      return;
    }
    if (parsed === undefined) {
      setError(draft.trim() ? "Bitte eine ganze Zahl eingeben." : "");
      return;
    }
    if (parsed !== value && !onCommit(parsed)) setError("Der Wert wurde nicht übernommen.");
  }

  function handleKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== "Escape") return;
    event.preventDefault();
    cancel.current = event.key === "Escape";
    event.currentTarget.blur();
  }

  function changeBy(amount: number) {
    setError(onCommit(value + amount) ? "" : "Der Wert wurde nicht übernommen.");
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={steps ? "number-control number-control--steps" : "number-control"}>
        {steps && (
          <button
            type="button"
            className="number-step"
            aria-label={`${label} verringern`}
            disabled={bounds?.min !== undefined && value - step < bounds.min}
            onClick={() => changeBy(-step)}
          >
            −
          </button>
        )}
        <input
          id={id}
          type="text"
          inputMode={signed ? "text" : "numeric"}
          autoComplete="off"
          value={draft ?? value}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(event) => {
            setError("");
            setDraft(event.target.value);
          }}
          onBlur={commitDraft}
          onKeyDown={handleKeys}
        />
        {steps && (
          <button
            type="button"
            className="number-step"
            aria-label={`${label} erhöhen`}
            disabled={bounds?.max !== undefined && value + step > bounds.max}
            onClick={() => changeBy(step)}
          >
            +
          </button>
        )}
      </div>
      {hint && (
        <small id={`${id}-hint`} className={`field__hint${error ? " field__hint--error" : ""}`}>
          {hint}
        </small>
      )}
    </div>
  );
}

export function StatList({
  entries,
  className = "",
}: {
  entries: ReadonlyArray<readonly [string, number | string]>;
  className?: string;
}) {
  return (
    <dl className={`stats-grid ${className}`}>
      {entries.map(([label, value]) => (
        <div className="stat-tile" key={label}>
          <dt>{label}</dt>
          <dd>{typeof value === "number" ? formatNumber(value) : value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ConfirmButton({
  label,
  prompt,
  confirmLabel,
  onConfirm,
  children,
}: {
  label: string;
  prompt: string;
  confirmLabel: string;
  onConfirm: () => boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="form-stack">
      <div>
        <button type="button" className="button button--danger" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {label}
        </button>
      </div>
      <div className="confirm-action" id={id} hidden={!open}>
        <p>{prompt}</p>
        {children}
        <div className="button-row">
          <button type="button" className="button button--danger" onClick={() => { if (onConfirm()) setOpen(false); }}>
            {confirmLabel}
          </button>
          <button type="button" className="button button--quiet" onClick={() => setOpen(false)}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
