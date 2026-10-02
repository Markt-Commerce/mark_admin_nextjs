"use client";

import { useId, useState } from "react";
import { ActionDialog } from "@/components/patterns/action-dialog";
import { Avatar } from "@/components/ui/avatar";
import { FormRow } from "@/components/patterns/form-row";
import { describedBy, Select } from "@/components/ui/field";
import { type AdminSellerDetail, LIMITS, MARKET_STATUSES, type MarketStatus } from "@/lib/api/types";
import { MARKET_STATUS } from "@/lib/status";
import { reviewMarket } from "./actions";

interface Props {
  open: boolean;
  onClose: () => void;
  seller: AdminSellerDetail;
  onSaved: (seller: AdminSellerDetail) => void;
}

/** Confirm or override the market check, including raising or clearing a flag. */
export function MarketReviewDialog(props: Props) {
  return props.open ? <MarketReviewModal {...props} /> : null;
}

function MarketReviewModal({ onClose, seller, onSaved }: Props) {
  const current = seller.market_verification_status ?? "unverified";
  const [status, setStatus] = useState<MarketStatus>(current);
  const selectId = useId();

  return (
    <ActionDialog
      open
      onClose={onClose}
      title="Review market check"
      identity={{ name: seller.shop_name ?? `Seller ${seller.id}`, subtitle: seller.shop_slug, avatar: <Avatar name={seller.shop_name ?? `Seller ${seller.id}`} size="lg" /> }}
      description={
        <>
          Set whether <strong>{seller.shop_name ?? `seller ${seller.id}`}</strong>&apos;s location matches the market it
          claims. Use the address and coordinates on the shop page.
        </>
      }
      confirmLabel={status === current ? "Confirm market status" : `Set to ${MARKET_STATUS[status].label.toLowerCase()}`}
      reason={{ mode: "optional", maxLength: LIMITS.reason, placeholder: "What did you check?" }}
      onConfirm={(reason) => reviewMarket(seller.id, status, reason)}
      onSuccess={onSaved}
    >
      <FormRow id={selectId} label="Market status" hint={MARKET_STATUS[status].description}>
        <Select data-autofocus {...describedBy(selectId, { hint: true })} id={selectId} value={status} onChange={(e) => setStatus(e.target.value as MarketStatus)}>
          {MARKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {MARKET_STATUS[s].label}
              {s === current ? " (current)" : ""}
            </option>
          ))}
        </Select>
      </FormRow>
    </ActionDialog>
  );
}
