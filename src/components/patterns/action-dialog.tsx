"use client";

import { ScrollText } from "lucide-react";
import { type ReactNode, useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { describedBy, Field, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Banner } from "@/components/ui/surface";
import type { ApiError, ApiResult } from "@/lib/api/errors";
import { useMe } from "@/lib/me-context";

/** Every confirmation says the action is recorded against the operator. */
export function AuditNotice() {
  const me = useMe();
  return (
    <p className="flex items-start gap-2 text-sm text-fg-muted">
      <ScrollText aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        This will be recorded in the audit log against your account
        {me ? (
          <>
            {" "}
            (<span className="font-medium text-fg">{me.email}</span>)
          </>
        ) : null}
        .
      </span>
    </p>
  );
}

export interface ReasonConfig {
  mode: "optional" | "required";
  /** Field label, e.g. "Reason" or "Note". */
  label?: string;
  maxLength: number;
  hint?: ReactNode;
  placeholder?: string;
}

/**
 * Confirm popup for one action, with an optional or required reason.
 * - `reason` omitted: a plain confirm (ConfirmDialog).
 * - `mode: "required"`: the submit button stays disabled until text is typed.
 * The API's response is handed to `onSuccess`; the dialog never guesses
 * the new state itself.
 */
export function ActionDialog<T>({
  open,
  onClose,
  title,
  description,
  consequences,
  confirmLabel,
  tone = "primary",
  reason,
  children,
  onConfirm,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** What will happen, in one or two sentences. */
  description: ReactNode;
  /** Warning shown above the form, e.g. "They will be signed out…". */
  consequences?: ReactNode;
  /** Names the action: "Ban user", never "Confirm". */
  confirmLabel: string;
  tone?: "primary" | "danger";
  reason?: ReasonConfig;
  /** Extra form content above the reason field. */
  children?: ReactNode;
  onConfirm: (reason: string | undefined) => Promise<ApiResult<T>>;
  onSuccess: (data: T) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, startTransition] = useTransition();
  const fieldId = useId();

  const trimmed = text.trim();
  const blocked = reason?.mode === "required" && trimmed.length === 0;
  const tooLong = reason ? text.length > reason.maxLength : false;
  const apiFieldError = error?.fieldErrors?.reason ?? error?.fieldErrors?.note;
  const fieldError =
    apiFieldError ?? (tooLong ? `Keep it to ${reason?.maxLength} characters or fewer.` : undefined);

  const close = () => {
    if (pending) return;
    setText("");
    setError(null);
    onClose();
  };

  const submit = () => {
    if (blocked || tooLong) return;
    setError(null);
    startTransition(async () => {
      const result = await onConfirm(trimmed || undefined);
      if (result.ok) {
        setText("");
        onSuccess(result.data);
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={description}
      busy={pending}
      footer={
        <>
          <Button onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={submit}
            loading={pending}
            disabled={blocked || tooLong}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {consequences && (
          <Banner tone={tone === "danger" ? "warning" : "info"} title="Before you continue">
            {consequences}
          </Banner>
        )}
        {children}
        {reason && (
          <Field
            id={fieldId}
            label={reason.label ?? "Reason"}
            required={reason.mode === "required"}
            optional={reason.mode === "optional"}
            hint={reason.hint}
            error={fieldError}
            counter={`${text.length} / ${reason.maxLength}`}
          >
            <Textarea
              id={fieldId}
              data-autofocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={reason.placeholder}
              required={reason.mode === "required"}
              aria-required={reason.mode === "required"}
              {...describedBy(fieldId, { hint: reason.hint, error: fieldError })}
            />
          </Field>
        )}
        {error && !apiFieldError && (
          <Banner tone="danger" title={`Couldn't ${confirmLabel.toLowerCase()}`}>
            {error.message}
          </Banner>
        )}
        <AuditNotice />
      </form>
    </Modal>
  );
}
