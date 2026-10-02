"use client";

import { Eye, EyeOff } from "lucide-react";
import { type ComponentProps, type ReactNode, useActionState, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { UnderlineInput } from "@/components/ui/field";
import { Banner } from "@/components/ui/surface";
import { login, type LoginState } from "./actions";

/**
 * Underline field whose label sits in the field like a placeholder
 * (reference C) and moves above it once there is text, so the label is
 * never lost while typing.
 */
function FloatingField({
  id,
  label,
  error,
  trailing,
  className,
  ...input
}: ComponentProps<"input"> & { id: string; label: string; error?: string; trailing?: ReactNode }) {
  return (
    <div>
      <div className="relative">
        <UnderlineInput
          id={id}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("peer pt-4", className)}
          {...input}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute top-1/2 left-0 origin-left -translate-y-1/2 text-sm text-fg-muted transition-all peer-focus:top-1 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
        >
          {label}
        </label>
        {trailing && <div className="absolute top-1/2 right-0 -translate-y-1/2">{trailing}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger-fg">
          {error}
        </p>
      )}
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <Banner tone="danger" title="Couldn't sign you in">
          {state.error}
        </Banner>
      )}
      <FloatingField
        id="email"
        name="email"
        type="email"
        label="Email address"
        autoComplete="username"
        defaultValue={state.email}
        key={state.email}
        required
        error={state.fieldErrors?.email}
      />
      <FloatingField
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        autoComplete="current-password"
        required
        className="pr-10"
        error={state.fieldErrors?.password}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-controls="password"
            className="inline-flex size-control items-center justify-center rounded-md text-fg-muted hover:text-fg"
          >
            {showPassword ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          </button>
        }
      />
      <div className="pt-4">
        <Button type="submit" variant="brand" loading={pending} className="min-w-52 px-10 text-base">
          {pending ? "Signing in" : "Sign in"}
        </Button>
      </div>
      <p className="text-sm text-fg-muted italic">
        *Do not share your sign-in details with anyone. Every action you take is recorded against your account.
      </p>
    </form>
  );
}
