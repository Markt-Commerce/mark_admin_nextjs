"use client";

import { Landmark, Hash, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useId, useState, useTransition } from "react";
import { AuditNotice } from "@/components/patterns/action-dialog";
import { FormRow } from "@/components/patterns/form-row";
import { Button } from "@/components/ui/button";
import { describedBy, IconInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Banner } from "@/components/ui/surface";
import type { ApiError } from "@/lib/api/errors";
import { type AdminSellerDetail, LIMITS } from "@/lib/api/types";
import { editPayout } from "./actions";

interface Props {
  open: boolean;
  onClose: () => void;
  seller: AdminSellerDetail;
  onSaved: (seller: AdminSellerDetail) => void;
}

type PayoutField = "payout_bank_code" | "payout_account_number" | "payout_account_name";

const FIELDS: Array<{ key: PayoutField; label: string; max: number; hint?: string; mono?: boolean }> = [
  { key: "payout_bank_code", label: "Bank code", max: LIMITS.payoutBankCode, hint: "The bank's CBN code, for example 058.", mono: true },
  { key: "payout_account_number", label: "Account number", max: LIMITS.payoutAccountNumber, mono: true },
  { key: "payout_account_name", label: "Account name", max: LIMITS.payoutAccountName, hint: "As it appears on the bank account." },
];

/** Finance-only editor. Only fields that changed are sent. */
export function PayoutDialog(props: Props) {
  return props.open ? <PayoutModal {...props} /> : null;
}

function PayoutModal({ onClose, seller, onSaved }: Props) {
  const baseId = useId();
  const original: Record<PayoutField, string> = {
    payout_bank_code: seller.payout?.bank_code ?? "",
    payout_account_number: seller.payout?.account_number ?? "",
    payout_account_name: seller.payout?.account_name ?? "",
  };
  const [values, setValues] = useState(original);
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, startTransition] = useTransition();

  const changes: Partial<Record<PayoutField, string>> = {};
  for (const f of FIELDS) if (values[f.key].trim() !== original[f.key]) changes[f.key] = values[f.key].trim();
  const dirty = Object.keys(changes).length > 0;
  const tooLong = FIELDS.find((f) => values[f.key].trim().length > f.max);

  const save = () => {
    if (!dirty || tooLong) return;
    setError(null);
    startTransition(async () => {
      const result = await editPayout(seller.id, changes);
      if (result.ok) {
        onSaved(result.data);
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      busy={pending}
      title="Edit payout details"
      identity={{ name: seller.shop_name ?? `Seller ${seller.id}`, subtitle: seller.shop_slug, avatar: <Avatar name={seller.shop_name ?? `Seller ${seller.id}`} size="lg" /> }}
      description={<>Bank account that {seller.shop_name ?? `seller ${seller.id}`}&apos;s earnings are paid into.</>}
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={pending} disabled={!dirty || !!tooLong}>
            Save payout details
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex flex-col gap-5"
        autoComplete="off"
      >
        <Banner tone="warning" title="Payouts go to this account">
          Check the details against the seller&apos;s bank documents. A wrong account sends their money to someone else.
        </Banner>
        <div className="flex flex-col">
          {FIELDS.map((f, i) => {
            const id = `${baseId}-${f.key}`;
            const fieldError =
              error?.fieldErrors?.[f.key] ??
              (values[f.key].trim().length > f.max ? `${f.label} can be up to ${f.max} characters.` : undefined);
            return (
              <FormRow key={f.key} id={id} label={f.label} hint={f.hint} error={fieldError}>
                <IconInput
                  icon={f.key === "payout_bank_code" ? <Landmark /> : f.key === "payout_account_number" ? <Hash /> : <UserRound />}
                  id={id}
                  value={values[f.key]}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [f.key]: e.target.value }));
                    setError(null);
                  }}
                  inputMode={f.key === "payout_account_name" ? "text" : "numeric"}
                  className={f.mono ? "font-mono" : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  {...(i === 0 ? { "data-autofocus": true } : {})}
                  {...describedBy(id, { hint: f.hint, error: fieldError })}
                />
              </FormRow>
            );
          })}
        </div>
        {error && !error.fieldErrors && (
          <Banner tone="danger" title="Couldn't save payout details">
            {error.message}
          </Banner>
        )}
        <AuditNotice />
      </form>
    </Modal>
  );
}
