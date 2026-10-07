"use client";

import { Check, Minus } from "lucide-react";
import { useState, useTransition } from "react";
import { AuditNotice } from "@/components/patterns/action-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Field, Textarea } from "@/components/ui/field";
import { Banner } from "@/components/ui/surface";
import type { ApiError } from "@/lib/api/errors";
import { ADMIN_ROLES, type AdminRole, type AdminUserDetail, LIMITS } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { CAPABILITIES, ROLE_SUMMARY, roleCan } from "@/lib/staff-roles";
import { ROLE_LABEL } from "@/lib/status";
import { setStaffRole } from "./actions";

/** "" is "Not staff"; the API takes it as null. */
type Choice = AdminRole | "";

interface Props {
  open: boolean;
  onClose: () => void;
  user: AdminUserDetail;
  onSaved: (user: AdminUserDetail) => void;
}

/** Mounted only while open, so the choice always starts from the record. */
export function StaffRoleDrawer(props: Props) {
  return props.open ? <StaffRolePanel {...props} /> : null;
}

function StaffRolePanel({ open, onClose, user, onSaved }: Props) {
  const current: Choice = isAdminRole(user.admin_role) ? user.admin_role : "";
  const [role, setRole] = useState<Choice>(current);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, startTransition] = useTransition();
  const name = user.username ?? user.email;
  // The API won't give a banned account a role, but will take one away.
  const banned = !!user.banned_at;

  const save = () => {
    if (role === current) return;
    setError(null);
    startTransition(async () => {
      const result = await setStaffRole(user.id, role || null, reason.trim() || undefined);
      if (result.ok) {
        onSaved(result.data);
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      busy={pending}
      title="Staff role"
      description={user.username ? `${user.username} · ${user.email}` : user.email}
      avatar={<Avatar src={user.profile_picture} name={name} size="md" />}
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={pending} disabled={role === current}>
            Save staff role
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex flex-col gap-6"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">Role</legend>
          <div className="flex flex-wrap gap-2">
            {(["", ...ADMIN_ROLES] as Choice[]).map((value) => (
              <label key={value || "none"} className="has-disabled:cursor-not-allowed">
                <input
                  type="radio"
                  name="staff-role"
                  value={value}
                  checked={role === value}
                  disabled={pending || (banned && value !== "")}
                  onChange={() => setRole(value)}
                  className="peer sr-only"
                  data-autofocus={role === value ? true : undefined}
                />
                <span
                  className={cn(
                    "inline-flex min-h-control cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium",
                    "border-border-strong bg-surface text-fg hover:bg-surface-hover",
                    "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary",
                    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
                    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                  )}
                >
                  {role === value && <Check aria-hidden className="size-4" />}
                  {value ? ROLE_LABEL[value] : "Not staff"}
                  {value === current && <span className="text-xs font-normal opacity-80">(current)</span>}
                </span>
              </label>
            ))}
          </div>
          <p className="text-sm text-fg-muted">{role ? ROLE_SUMMARY[role] : "Can't open the staff console."}</p>
        </fieldset>

        {banned && (
          <Banner tone="info" title="This account is banned">
            A banned account can&apos;t be given a staff role. Unban it first if they should have one.
          </Banner>
        )}
        {role === "super_admin" && current !== "super_admin" && (
          <Banner tone="warning" title="Super admin can do everything">
            That includes giving and removing other people&apos;s staff roles. Only choose it for people who run Markt.
          </Banner>
        )}
        {role === "" && current !== "" && (
          <Banner tone="info" title="They'll lose access to the console straight away">
            Their Markt account itself isn&apos;t affected.
          </Banner>
        )}

        <RoleComparison selected={role} />

        <Field id="staff-role-reason" label="Reason" optional counter={`${reason.length} / ${LIMITS.reason}`}>
          <Textarea
            id="staff-role-reason"
            rows={2}
            maxLength={LIMITS.reason}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this role changing?"
            disabled={pending}
          />
        </Field>

        {error && (
          <Banner tone="danger" title="Couldn't change the staff role">
            {error.message}
          </Banner>
        )}
        <AuditNotice />
      </form>
    </Drawer>
  );
}

/** Every role against every capability, with the chosen role's column lit. */
function RoleComparison({ selected }: { selected: Choice }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Compare roles</h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">What each staff role can do</caption>
          <thead className="bg-surface-muted">
            <tr>
              <th scope="col" className="px-3 py-2.5 text-left text-[13px] font-medium text-fg-muted">
                Can…
              </th>
              {ADMIN_ROLES.map((r) => (
                <th
                  key={r}
                  scope="col"
                  className={cn(
                    "px-2 py-2.5 text-center text-[13px] font-medium",
                    selected === r ? "bg-brand-subtle font-semibold text-brand-strong" : "text-fg-muted",
                  )}
                >
                  {ROLE_LABEL[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((row, i) => (
              <tr key={row.permission} className="border-t border-border">
                <th scope="row" className="px-3 py-2 text-left font-normal">
                  {(i === 0 || CAPABILITIES[i - 1].group !== row.group) && (
                    <span className="mb-0.5 block text-[11px] font-semibold tracking-wider text-fg-muted uppercase">{row.group}</span>
                  )}
                  {row.label}
                </th>
                {ADMIN_ROLES.map((r) => (
                  <td key={r} className={cn("px-2 py-2 text-center", selected === r && "bg-brand-subtle")}>
                    {roleCan(r, row.permission) ? (
                      <Check aria-label="Yes" className="mx-auto size-4 text-success-fg" />
                    ) : (
                      <Minus aria-label="No" className="mx-auto size-4 text-border-strong" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function isAdminRole(value: string | null): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value ?? "");
}
