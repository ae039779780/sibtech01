import { cn } from "@/lib/format";
import type { ReactNode } from "react";

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: "muted" | "ok" | "warn" | "danger" | "teal";
  children: ReactNode;
}) {
  const map = {
    muted: "bg-white/5 text-muted",
    ok: "bg-ok/15 text-ok",
    warn: "bg-warn/15 text-warn",
    danger: "bg-danger/15 text-danger",
    teal: "bg-teal/15 text-teal",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  type = "button",
  className,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const styles = {
    primary:
      "bg-teal text-navy hover:bg-teal/90 disabled:opacity-50 font-semibold",
    ghost:
      "border border-line bg-transparent text-ink hover:bg-white/5 disabled:opacity-50",
    danger: "bg-danger/90 text-white hover:bg-danger",
  } as const;
  const cls = cn(
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm transition",
    styles[variant],
    className,
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      {children ?? (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-xl border border-line bg-navy-lift/40 px-3 py-2 text-sm text-ink outline-none ring-teal/40 focus:ring-2"
        />
      )}
    </label>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-teal">{eyebrow}</p>
        ) : null}
        <h1 className="display text-3xl tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="card hairline p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}

export function DemoBadge({ children = "DEMO" }: { children?: ReactNode }) {
  return <Badge tone="warn">{children}</Badge>;
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-sm text-muted">
      <span className="mr-2 inline-flex rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warn">
        DEMO
      </span>
      {children}
    </p>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card hairline p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
