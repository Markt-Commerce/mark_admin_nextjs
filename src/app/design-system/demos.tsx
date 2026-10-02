"use client";

import { Ban, Pencil, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";
import { ActionDialog } from "@/components/patterns/action-dialog";
import { FormRow } from "@/components/patterns/form-row";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { describedBy, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import type { ApiResult } from "@/lib/api/errors";
import { MeProvider } from "@/lib/me-context";

/** Sample identity for the audit notice in these demos only. */
const SAMPLE_ME = {
  user_id: "USR_SAMPLE",
  email: "you@markt.test",
  is_admin: false,
  is_super_admin: false,
  admin_role: "support",
  permissions: [],
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function simulate(outcome: "ok" | "error"): Promise<ApiResult<null>> {
  await wait(700);
  return outcome === "ok"
    ? { ok: true, data: null }
    : { ok: false, error: { status: 403, message: "Only a super admin may action an admin account" } };
}

export function DialogDemos() {
  const toast = useToast();
  const [open, setOpen] = useState<null | "edit" | "optional" | "required" | "confirm" | "error">(null);
  const close = () => setOpen(null);
  const done = (msg: string) => () => toast.success(msg);

  return (
    <MeProvider me={SAMPLE_ME}>
      <div className="flex flex-wrap gap-3">
        <Button icon={<Pencil className="size-4" />} onClick={() => setOpen("edit")}>
          Edit form (reference D)
        </Button>
        <Button variant="danger" icon={<Ban className="size-4" />} onClick={() => setOpen("optional")}>
          Optional reason
        </Button>
        <Button variant="danger" onClick={() => setOpen("required")}>
          Required reason
        </Button>
        <Button variant="primary" icon={<ShieldCheck className="size-4" />} onClick={() => setOpen("confirm")}>
          Plain confirm
        </Button>
        <Button onClick={() => setOpen("error")}>Request that fails</Button>
      </div>

      <EditDemo open={open === "edit"} onClose={close} />

      <ActionDialog
        open={open === "optional"}
        onClose={close}
        title="Ban user"
        description="Bans ada@example.test from Markt."
        consequences="They'll be signed out straight away and can't sign in again until they're unbanned."
        confirmLabel="Ban user"
        tone="danger"
        reason={{ mode: "optional", maxLength: 255, placeholder: "Why is this account being banned?" }}
        onConfirm={() => simulate("ok")}
        onSuccess={done("User banned")}
      />
      <ActionDialog
        open={open === "required"}
        onClose={close}
        title="Reject verification"
        description="Rejects Balogun Fabrics' verification. The seller sees the reason."
        confirmLabel="Reject verification"
        tone="danger"
        reason={{ mode: "required", maxLength: 500, hint: "Required. Tell the seller what to fix." }}
        onConfirm={() => simulate("ok")}
        onSuccess={done("Verification rejected")}
      />
      <ActionDialog
        open={open === "confirm"}
        onClose={close}
        title="Mark email as verified"
        description="Marks ada@example.test as verified without a code."
        confirmLabel="Mark as verified"
        onConfirm={() => simulate("ok")}
        onSuccess={done("Email marked as verified")}
      />
      <ActionDialog
        open={open === "error"}
        onClose={close}
        title="Suspend user"
        description="Shows how an API error appears inside the dialog."
        confirmLabel="Suspend user"
        tone="danger"
        reason={{ mode: "optional", maxLength: 255 }}
        onConfirm={() => simulate("error")}
        onSuccess={done("User suspended")}
      />
    </MeProvider>
  );
}

function EditDemo({ open, onClose }: { open: boolean; onClose: () => void }) {
  const phoneId = useId();
  const userId = useId();
  const [pending, setPending] = useState(false);
  const toast = useToast();
  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={pending}
      title="Edit profile"
      description="Correct this user's contact details. Changes are recorded in the audit log."
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={pending}
            onClick={async () => {
              setPending(true);
              await wait(700);
              setPending(false);
              onClose();
              toast.success("Profile saved");
            }}
          >
            Save changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col">
        <FormRow label="Profile photo">
          <div className="flex items-center gap-4">
            <Avatar name="Ada Lovelace" size="lg" />
            <Button>Upload new photo</Button>
          </div>
        </FormRow>
        <FormRow id={userId} label="Username">
          <Input id={userId} defaultValue="ada_0" />
        </FormRow>
        <FormRow id={phoneId} label="Phone number" error="Phone number must be 20 characters or fewer.">
          <Input id={phoneId} defaultValue="+234 800 000 0000 0000" {...describedBy(phoneId, { error: true })} />
        </FormRow>
      </div>
    </Modal>
  );
}

export function ToastDemos() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast.success("Verification code sent to ada@example.test")}>Success toast</Button>
      <Button onClick={() => toast.error("The verification email could not be sent. Try again in a few minutes.")}>
        Error toast
      </Button>
    </div>
  );
}

export function TabsDemo() {
  return (
    <Tabs
      label="Demo tabs"
      items={[
        { id: "overview", label: "Overview", content: <p className="text-sm">Overview panel. Use the arrow keys to move between tabs.</p> },
        { id: "buyer", label: "Buyer profile", content: <p className="text-sm">Buyer panel.</p> },
        { id: "seller", label: "Seller profile", content: <p className="text-sm">Seller panel.</p> },
      ]}
    />
  );
}
