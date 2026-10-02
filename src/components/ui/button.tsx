import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "danger" | "danger-outline" | "ghost";

const base =
  "inline-flex min-h-control items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold whitespace-nowrap " +
  "transition-colors disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  // Safe main action (Save, Verify). Never brand-coloured, never red.
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover disabled:bg-border-strong disabled:text-fg-muted",
  secondary:
    "border border-border-strong bg-surface text-fg hover:bg-surface-hover disabled:text-fg-muted disabled:bg-surface-muted",
  // Destructive or severe only (Ban, Reject, Suspend).
  danger:
    "bg-danger text-on-danger hover:bg-danger-hover disabled:bg-danger-border disabled:text-danger-fg",
  // Opens a destructive flow (e.g. "Ban user" in an action bar). The solid
  // danger button is kept for the final confirm inside the dialog.
  "danger-outline":
    "border border-danger-border bg-surface text-danger-fg hover:bg-danger-subtle disabled:text-fg-muted disabled:border-border",
  ghost: "text-fg hover:bg-surface-hover disabled:text-fg-muted",
};

interface CommonProps {
  variant?: ButtonVariant;
  /** Leading icon. Decorative: the label must still say what happens. */
  icon?: ReactNode;
  fullWidth?: boolean;
}

export interface ButtonProps extends ComponentProps<"button">, CommonProps {
  loading?: boolean;
}

export function Button({
  variant = "secondary",
  icon,
  fullWidth,
  loading,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], fullWidth && "w-full", className)}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends ComponentProps<typeof Link>, CommonProps {}

export function ButtonLink({ variant = "secondary", icon, fullWidth, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], fullWidth && "w-full", className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}

/** Square icon-only button. `label` is required: it becomes the accessible name. */
export function IconButton({
  label,
  icon,
  className,
  type = "button",
  ...rest
}: Omit<ComponentProps<"button">, "children"> & { label: string; icon: ReactNode }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-control items-center justify-center rounded-md text-fg-muted hover:bg-surface-hover hover:text-fg disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
