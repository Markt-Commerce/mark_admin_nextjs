"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Input } from "@/components/ui/field";
import { Banner } from "@/components/ui/surface";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);
  const emailError = state.fieldErrors?.email;
  const passwordError = state.fieldErrors?.password;

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <Banner tone="danger" title="Couldn't sign you in">
          {state.error}
        </Banner>
      )}
      <Field id="email" label="Email address" error={emailError}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          key={state.email}
          required
          {...describedBy("email", { error: emailError })}
        />
      </Field>
      <Field id="password" label="Password" error={passwordError}>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-12"
            {...describedBy("password", { error: passwordError })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-controls="password"
            className="absolute top-0 right-0 inline-flex size-control items-center justify-center rounded-md text-fg-muted hover:text-fg"
          >
            {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
          </button>
        </div>
      </Field>
      <Button type="submit" variant="primary" loading={pending} fullWidth className="mt-1">
        {pending ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
