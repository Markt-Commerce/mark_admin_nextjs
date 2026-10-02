import type { ReactNode } from "react";

/** A section inside the shared, divided record layout (reference B). */
export function DetailPanel({ title, description, actions, children }: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 px-5 py-5">
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

/** Activity-style rows for facts actually returned by the API. */
export function RecordFacts({ items }: {
  items: Array<{ label: string; icon: ReactNode; value: ReactNode; note?: ReactNode }>;
}) {
  return (
    <dl className="flex flex-col gap-5">
      {items.map(({ label, icon, value, note }) => (
        <div key={label} className="min-w-0">
          <dt className="flex items-center gap-3 text-sm font-semibold">
            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-muted text-fg-muted [&>svg]:size-4">{icon}</span>
            {label}
          </dt>
          <dd className="mt-2 ml-11 rounded-md border border-border px-3 py-2.5 text-sm break-words">
            {value}
            {note && <p className="mt-1 text-fg-muted">{note}</p>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
