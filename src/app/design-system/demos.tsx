"use client";

import { Ban, Pencil, ShieldCheck, MoreHorizontal, Phone, UserRound } from "lucide-react";
import { useId, useRef, useState } from "react";
import { ActionDialog } from "@/components/patterns/action-dialog";
import { FormRow } from "@/components/patterns/form-row";
import { Avatar } from "@/components/ui/avatar";
import { Button, IconButton, circleIconClass } from "@/components/ui/button";
import { describedBy, IconInput } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/copy-button";
import { Menu } from "@/components/ui/menu";
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

const identity = { name: "ada_0", subtitle: "ada@example.test", avatar: <Avatar name="Ada Lovelace" size="lg" /> };

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
        identity={identity}
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
        identity={identity}
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
        identity={identity}
        open={open === "confirm"}
        onClose={close}
        title="Mark email as verified"
        description="Marks ada@example.test as verified without a code."
        confirmLabel="Mark as verified"
        onConfirm={() => simulate("ok")}
        onSuccess={done("Email marked as verified")}
      />
      <ActionDialog
        identity={identity}
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string>();
  const userId = useId();
  const [pending, setPending] = useState(false);
  const toast = useToast();
  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={pending}
      title="Edit profile"
      identity={{ ...identity, actions: <CopyButton value="ada@example.test" label="email" variant="button" /> }}
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
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" aria-label="Choose a demo photo" onChange={(e) => setFilename(e.target.files?.[0]?.name)} />
            <Button onClick={() => fileRef.current?.click()}>Click to replace</Button>
          </div>
          {filename && <p className="text-sm text-fg-muted">Selected: {filename}. This demo does not upload files.</p>}
        </FormRow>
        <FormRow id={userId} label="Username">
          <IconInput icon={<UserRound />} id={userId} defaultValue="ada_0" />
        </FormRow>
        <FormRow id={phoneId} label="Phone number" error="Phone number must be 20 characters or fewer.">
          <IconInput icon={<Phone />} id={phoneId} defaultValue="+234 800 000 0000 0000" {...describedBy(phoneId, { error: true })} />
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

/** The persistent menu trigger receives focus again when a dialog closes. */
export function RecordActionsDemo() {
  const [open, setOpen] = useState<"edit" | "suspend" | null>(null);
  return (
    <>
      <div className="flex justify-center gap-2">
        <IconButton shape="circle" label="Edit demo profile" icon={<Pencil className="size-4" />} onClick={() => setOpen("edit")} />
        <Menu label="More demo actions" trigger={<MoreHorizontal className="size-4" />} triggerClassName={circleIconClass} sections={[
          { label: "Account access", items: [{ label: "Suspend user", icon: <Ban />, danger: true, onSelect: () => setOpen("suspend") }] },
        ]} />
      </div>
      <EditDemo open={open === "edit"} onClose={() => setOpen(null)} />
      <ActionDialog open={open === "suspend"} onClose={() => setOpen(null)} identity={identity} title="Suspend user" description="A demonstration only; no account is changed." confirmLabel="Suspend user" tone="danger" reason={{ mode: "optional", maxLength: 255 }} onConfirm={() => simulate("ok")} onSuccess={() => {}} />
    </>
  );
}
