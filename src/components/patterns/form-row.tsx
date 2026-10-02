import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Label on the left, field on the right (reference D). Rows are separated
 * by a rule. On narrow screens the label moves above the field.
 */
export function FormRow({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  /** id of the control, for the label. Omit for groups (then label is a heading). */
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const LabelTag = id ? "label" : "p";
  return (
    <div
      className={cn(
        "grid gap-2 border-b border-border py-4 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6",
        className,
      )}
    >
      <div className="pt-2.5">
        <LabelTag {...(id ? { htmlFor: id } : {})} className="text-sm font-semibold text-fg">
          {label}
          {required && <span className="text-danger-fg"> *</span>}
        </LabelTag>
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        {children}
        {hint && !error && (
          <p id={id ? `${id}-hint` : undefined} className="text-sm text-fg-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={id ? `${id}-error` : undefined} role="alert" className="text-sm font-medium text-danger-fg">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
