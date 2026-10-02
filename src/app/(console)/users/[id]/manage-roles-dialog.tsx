"use client";

import { useState, useTransition } from "react";
import { AuditNotice } from "@/components/patterns/action-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Banner } from "@/components/ui/surface";
import type { ApiError } from "@/lib/api/errors";
import type { AdminUserDetail } from "@/lib/api/types";
import { setRoles } from "./actions";

/**
 * Two independent toggles. Only a toggle the operator changed is sent;
 * the other is omitted, so the API leaves it as it is.
 */
interface Props {
  open: boolean;
  onClose: () => void;
  user: AdminUserDetail;
  onSaved: (user: AdminUserDetail) => void;
}

/** Mounted only while open, so the toggles always start from the record. */
export function ManageRolesDialog(props: Props) {
  return props.open ? <ManageRolesModal {...props} /> : null;
}

function ManageRolesModal({ open, onClose, user, onSaved }: Props) {
  const [buyer, setBuyer] = useState(user.is_buyer);
  const [seller, setSeller] = useState(user.is_seller);
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, startTransition] = useTransition();

  const changes: { is_buyer?: boolean; is_seller?: boolean } = {};
  if (buyer !== user.is_buyer) changes.is_buyer = buyer;
  if (seller !== user.is_seller) changes.is_seller = seller;
  const dirty = Object.keys(changes).length > 0;

  // The API can only turn a role on if its profile already exists.
  const buyerLocked = !user.buyer && !user.is_buyer;
  const sellerLocked = !user.seller && !user.is_seller;

  const save = () => {
    if (!dirty) return;
    setError(null);
    startTransition(async () => {
      const result = await setRoles(user.id, changes);
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
      open={open}
      onClose={onClose}
      busy={pending}
      title="Manage buyer and seller roles"
      identity={{ name: user.username ?? user.email, subtitle: user.email, avatar: <Avatar src={user.profile_picture} name={user.username ?? user.email} size="lg" /> }}
      description={<>Turn {user.email}&apos;s buyer and seller roles on or off.</>}
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={pending} disabled={!dirty}>
            Save roles
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border px-4">
          <Toggle
            label="Buyer role"
            description={buyerLocked ? "No buyer profile yet. The user has to create one in the app first." : "Can shop on Markt."}
            checked={buyer}
            disabled={buyerLocked || pending}
            onChange={(e) => setBuyer(e.target.checked)}
            data-autofocus
          />
          <Toggle
            label="Seller role"
            description={sellerLocked ? "No seller profile yet. The user has to create one in the app first." : "Can sell on Markt."}
            checked={seller}
            disabled={sellerLocked || pending}
            onChange={(e) => setSeller(e.target.checked)}
          />
        </div>
        {changes.is_seller === false && (
          <Banner tone="warning" title="Turning off the seller role stops their shop selling">
            The shop is deactivated with the role. Turning the role back on reactivates it.
          </Banner>
        )}
        {changes.is_buyer === false && (
          <Banner tone="warning" title="Turning off the buyer role stops them shopping">
            Their buyer profile is deactivated with the role.
          </Banner>
        )}
        {error && (
          <Banner tone="danger" title="Couldn't update roles">
            {error.message}
          </Banner>
        )}
        <AuditNotice />
      </form>
    </Modal>
  );
}
