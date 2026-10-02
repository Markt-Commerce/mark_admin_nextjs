"use client";

import {
  Ban,
  BadgeCheck,
  CircleDashed,
  LogOut,
  MailCheck,
  Pencil,
  PlayCircle,
  Send,
  ShieldOff,
  Undo2,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActionDialog } from "@/components/patterns/action-dialog";
import { DetailLayout } from "@/components/patterns/layout";
import { ActionGroup, ProfileCard } from "@/components/patterns/profile-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge, MarketPill, RoleChip, SellingPill, UserStatusPill, VerificationPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackLink, Banner, Card, DetailList } from "@/components/ui/surface";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { type AdminUserDetail, LIMITS } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { useMe } from "@/lib/me-context";
import { can, canActOnAccount } from "@/lib/permissions";
import { roleLabel } from "@/lib/status";
import { resendVerification, userReasonAction, verifyEmail } from "./actions";
import { EditProfileDialog } from "./edit-profile-dialog";
import { ManageRolesDialog } from "./manage-roles-dialog";

type DialogKey =
  | "edit"
  | "roles"
  | "suspend"
  | "reinstate"
  | "ban"
  | "unban"
  | "force-logout"
  | "verify-email"
  | "resend";

export function UserDetailView({ initialUser }: { initialUser: AdminUserDetail }) {
  const me = useMe();
  const toast = useToast();
  const [user, setUser] = useState(initialUser);
  const [open, setOpen] = useState<DialogKey | null>(null);
  const close = () => setOpen(null);

  if (!me) return null;

  const name = user.username ?? user.email;
  const deleted = !!user.deleted_at;
  const access = canActOnAccount(me, user);
  // Every account action needs the account to exist and be one the
  // operator may act on; each button then also needs its own permission.
  const actionable = !deleted && access.allowed;
  const allow = (p: Parameters<typeof can>[1]) => actionable && can(me, p);

  /** Apply the API's response and confirm with a toast. */
  const applied = (message: string) => (next: AdminUserDetail) => {
    setUser(next);
    toast.success(message);
  };

  const profileActions = allow("user.edit") && (
    <ActionGroup label="Profile">
      <Button fullWidth icon={<Pencil className="size-4" />} onClick={() => setOpen("edit")}>
        Edit profile
      </Button>
    </ActionGroup>
  );

  const emailActions = allow("user.verify_email") && !user.email_verified && (
    <ActionGroup label="Email">
      <Button fullWidth icon={<MailCheck className="size-4" />} onClick={() => setOpen("verify-email")}>
        Mark email as verified
      </Button>
      <Button fullWidth icon={<Send className="size-4" />} onClick={() => setOpen("resend")}>
        Resend verification code
      </Button>
    </ActionGroup>
  );

  const roleActions = allow("user.manage_roles") && (
    <ActionGroup label="Roles">
      <Button fullWidth icon={<UserCog className="size-4" />} onClick={() => setOpen("roles")}>
        Manage buyer and seller roles
      </Button>
    </ActionGroup>
  );

  const sessionActions = allow("user.force_logout") && (
    <ActionGroup label="Sessions">
      <Button fullWidth icon={<LogOut className="size-4" />} onClick={() => setOpen("force-logout")}>
        Sign out everywhere
      </Button>
    </ActionGroup>
  );

  // Escalating severity: suspend (temporary hold), then ban (removal).
  const canSuspend = allow("user.suspend") && !user.suspended_at && !user.banned_at;
  const canBan = allow("user.ban") && !user.banned_at;
  const accessActions = (canSuspend || canBan) && (
    <ActionGroup label="Account access">
      {canSuspend && (
        <Button fullWidth variant="danger-outline" icon={<ShieldOff className="size-4" />} onClick={() => setOpen("suspend")}>
          Suspend user
        </Button>
      )}
      {canBan && (
        <Button fullWidth variant="danger-outline" icon={<Ban className="size-4" />} onClick={() => setOpen("ban")}>
          Ban user
        </Button>
      )}
    </ActionGroup>
  );

  const anyAction = profileActions || emailActions || roleActions || sessionActions || accessActions;
  const staffRole = roleLabel(user.admin_role);

  return (
    <>
      <DetailLayout
        back={<BackLink href="/users">Back to users</BackLink>}
        banners={<StateBanners user={user} onReinstate={allow("user.suspend") ? () => setOpen("reinstate") : undefined} onUnban={allow("user.ban") ? () => setOpen("unban") : undefined} accessNote={deleted ? undefined : access.allowed ? undefined : access.reason} />}
        profile={
          <ProfileCard
            avatar={<Avatar src={user.profile_picture} name={name} size="xl" />}
            name={name}
            subtitle={user.username ? user.email : undefined}
            badges={
              <>
                <UserStatusPill status={user.status} />
                {user.is_buyer && <RoleChip>Buyer</RoleChip>}
                {user.is_seller && <RoleChip>Seller</RoleChip>}
                {user.is_admin && <RoleChip tone="brand">Admin</RoleChip>}
                {staffRole && <RoleChip tone={user.admin_role === "super_admin" ? "brand" : "info"}>{staffRole}</RoleChip>}
              </>
            }
            actions={
              anyAction ? (
                <>
                  {profileActions}
                  {emailActions}
                  {roleActions}
                  {sessionActions}
                  {accessActions}
                </>
              ) : (
                <p className="text-sm text-fg-muted">
                  {deleted
                    ? "This account was deleted, so no actions are available."
                    : !access.allowed
                      ? access.reason
                      : "Your role has no actions for this account."}
                </p>
              )
            }
          />
        }
        main={
          <Card bodyClassName="pt-2">
            <Tabs
              label="User information"
              items={[
                { id: "account", label: "Account", content: <AccountDetails user={user} /> },
                { id: "state", label: "Account state", content: <AccountState user={user} /> },
              ]}
            />
          </Card>
        }
        aside={
          <>
            <BuyerPanel user={user} />
            <SellerPanel user={user} canViewSellers={can(me, "seller.view")} />
          </>
        }
      />

      <EditProfileDialog open={open === "edit"} onClose={close} user={user} onSaved={applied("Profile saved")} />
      <ManageRolesDialog open={open === "roles"} onClose={close} user={user} onSaved={applied("Roles updated")} />

      <ActionDialog
        open={open === "suspend"}
        onClose={close}
        title="Suspend user"
        description={<>Temporarily blocks <strong>{user.email}</strong> from signing in to Markt.</>}
        consequences="They'll be signed out straight away and can't sign in again until a staff member reinstates them. Their data and orders are kept."
        confirmLabel="Suspend user"
        tone="danger"
        reason={{ mode: "optional", maxLength: LIMITS.reason, placeholder: "Why is this account being suspended?" }}
        onConfirm={(reason) => userReasonAction(user.id, "suspend", reason)}
        onSuccess={applied("User suspended")}
      />
      <ActionDialog
        open={open === "reinstate"}
        onClose={close}
        title="Reinstate user"
        description={<>Lifts the suspension on <strong>{user.email}</strong> so they can sign in again.</>}
        consequences={user.banned_at ? "This account is also banned. It stays banned until it's unbanned." : undefined}
        confirmLabel="Reinstate user"
        reason={{ mode: "optional", maxLength: LIMITS.reason }}
        onConfirm={(reason) => userReasonAction(user.id, "reinstate", reason)}
        onSuccess={applied("Suspension lifted")}
      />
      <ActionDialog
        open={open === "ban"}
        onClose={close}
        title="Ban user"
        description={<>Removes <strong>{user.email}</strong> from Markt. Use this for serious or repeated breaches; for a temporary hold, suspend instead.</>}
        consequences="They'll be signed out straight away and can't sign in again unless a staff member unbans them."
        confirmLabel="Ban user"
        tone="danger"
        reason={{ mode: "optional", maxLength: LIMITS.reason, placeholder: "Why is this account being banned?" }}
        onConfirm={(reason) => userReasonAction(user.id, "ban", reason)}
        onSuccess={applied("User banned")}
      />
      <ActionDialog
        open={open === "unban"}
        onClose={close}
        title="Unban user"
        description={<>Lifts the ban on <strong>{user.email}</strong>.</>}
        consequences={user.suspended_at ? "This account is also suspended. It can't sign in until it's reinstated." : undefined}
        confirmLabel="Unban user"
        reason={{ mode: "optional", maxLength: LIMITS.reason }}
        onConfirm={(reason) => userReasonAction(user.id, "unban", reason)}
        onSuccess={applied("Ban lifted")}
      />
      <ActionDialog
        open={open === "force-logout"}
        onClose={close}
        title="Sign out everywhere"
        description={<>Ends every session <strong>{user.email}</strong> has, on all devices.</>}
        consequences="They can sign straight back in with their password. To stop them signing in, suspend or ban the account instead."
        confirmLabel="Sign out everywhere"
        reason={{ mode: "optional", maxLength: LIMITS.reason }}
        onConfirm={(reason) => userReasonAction(user.id, "force-logout", reason)}
        onSuccess={applied("All sessions ended")}
      />
      <ActionDialog
        open={open === "verify-email"}
        onClose={close}
        title="Mark email as verified"
        description={<>Marks <strong>{user.email}</strong> as verified without the user entering a code. Only do this after confirming they own the address.</>}
        confirmLabel="Mark as verified"
        onConfirm={() => verifyEmail(user.id)}
        onSuccess={applied("Email marked as verified")}
      />
      <ActionDialog
        open={open === "resend"}
        onClose={close}
        title="Resend verification code"
        description={<>Emails a new verification code to <strong>{user.email}</strong>.</>}
        confirmLabel="Send code"
        onConfirm={() => resendVerification(user.id)}
        onSuccess={(res) => toast.success(<>Verification code sent to <strong>{res.email}</strong></>)}
      />
    </>
  );
}

function StateBanners({
  user,
  onReinstate,
  onUnban,
  accessNote,
}: {
  user: AdminUserDetail;
  onReinstate?: () => void;
  onUnban?: () => void;
  accessNote?: string;
}) {
  const banners = [];
  if (user.deleted_at) {
    banners.push(
      <Banner key="deleted" tone="info" title={`Deleted by the user on ${formatDateTime(user.deleted_at)}`}>
        Deletion is permanent. The record is kept so orders and reviews stay intact.
      </Banner>,
    );
  }
  if (user.banned_at) {
    banners.push(
      <Banner
        key="banned"
        tone="danger"
        title={`Banned on ${formatDateTime(user.banned_at)}`}
        actions={onUnban && <Button icon={<Undo2 className="size-4" />} onClick={onUnban}>Unban user</Button>}
      >
        {user.ban_reason ?? "No reason was recorded."}
      </Banner>,
    );
  }
  if (user.suspended_at) {
    banners.push(
      <Banner
        key="suspended"
        tone="warning"
        title={`Suspended on ${formatDateTime(user.suspended_at)}`}
        actions={onReinstate && <Button icon={<PlayCircle className="size-4" />} onClick={onReinstate}>Reinstate user</Button>}
      >
        {user.suspension_reason ?? "No reason was recorded."}
      </Banner>,
    );
  }
  if (!user.is_active && !user.deleted_at) {
    banners.push(
      <Banner
        key="deactivated"
        tone="info"
        title={user.deactivated_at ? `Deactivated by the user on ${formatDateTime(user.deactivated_at)}` : "Deactivated by the user"}
      >
        The user chose to deactivate their account. Staff can&apos;t reverse this from the console, and reinstating only lifts a staff suspension.
      </Banner>,
    );
  }
  if (accessNote) {
    banners.push(
      <Banner key="access" tone="info" title="Account actions are off for this account">
        {accessNote}
      </Banner>,
    );
  }
  return banners.length ? <>{banners}</> : null;
}

function AccountDetails({ user }: { user: AdminUserDetail }) {
  return (
    <DetailList
      items={[
        { label: "User ID", value: <span className="font-mono">{user.id}</span> },
        { label: "Email", value: user.email },
        {
          label: "Email verified",
          value: user.email_verified ? (
            <span className="inline-flex items-center gap-1.5 text-success-fg">
              <BadgeCheck aria-hidden className="size-4" /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-fg-muted">
              <CircleDashed aria-hidden className="size-4" /> Not verified
            </span>
          ),
        },
        { label: "Username", value: user.username },
        { label: "Phone number", value: user.phone_number },
        { label: "Joined", value: formatDateTime(user.created_at) },
        { label: "Last sign-in", value: formatDateTime(user.last_login_at) ?? "Never" },
        { label: "Staff role", value: roleLabel(user.admin_role) ?? (user.is_admin ? "Full-access admin" : "None") },
      ]}
    />
  );
}

/** Each state with its own timestamp and reason; never merged into one. */
function AccountState({ user }: { user: AdminUserDetail }) {
  const yesNo = (on: boolean, yes: string) => (on ? yes : "No");
  return (
    <DetailList
      items={[
        { label: "Overall status", value: <UserStatusPill status={user.status} /> },
        { label: "Suspended", value: yesNo(!!user.suspended_at, `Since ${formatDateTime(user.suspended_at)}`) },
        { label: "Suspension reason", value: user.suspension_reason },
        { label: "Banned", value: yesNo(!!user.banned_at, `Since ${formatDateTime(user.banned_at)}`) },
        { label: "Ban reason", value: user.ban_reason },
        {
          label: "Active (user's own setting)",
          value: user.is_active ? "Yes" : `No, deactivated ${user.deactivated_at ? formatDateTime(user.deactivated_at) : ""}`.trim(),
        },
        { label: "Deleted", value: yesNo(!!user.deleted_at, `On ${formatDateTime(user.deleted_at)}`) },
      ]}
    />
  );
}

function BuyerPanel({ user }: { user: AdminUserDetail }) {
  const buyer = user.buyer;
  return (
    <Card title="Buyer profile">
      {buyer ? (
        <DetailList
          items={[
            { label: "Buyer name", value: buyer.buyername },
            { label: "Profile", value: buyer.is_active ? <Badge tone="success" shape="chip">Active</Badge> : <Badge tone="neutral" shape="chip">Turned off</Badge> },
            { label: "Refunds go to", value: buyer.refund_preference === "wallet" ? "Markt wallet" : buyer.refund_preference === "card" ? "Original card" : buyer.refund_preference },
          ]}
        />
      ) : (
        <p className="text-sm text-fg-muted">This account has no buyer profile.</p>
      )}
    </Card>
  );
}

function SellerPanel({ user, canViewSellers }: { user: AdminUserDetail; canViewSellers: boolean }) {
  const seller = user.seller;
  return (
    <Card
      title="Seller profile"
      actions={
        seller && canViewSellers ? (
          <Link
            href={`/sellers/${seller.id}`}
            className="inline-flex min-h-control items-center rounded-md px-2 text-sm font-semibold text-brand-strong hover:underline"
          >
            Open shop
          </Link>
        ) : undefined
      }
    >
      {seller ? (
        <DetailList
          items={[
            { label: "Shop", value: seller.shop_name },
            { label: "Shop handle", value: seller.shop_slug && <span className="font-mono text-xs">{seller.shop_slug}</span> },
            { label: "Selling", value: <SellingPill active={seller.is_active} /> },
            { label: "Verification", value: <VerificationPill status={seller.verification_status} /> },
            { label: "Market", value: <MarketPill status={seller.market_verification_status} /> },
          ]}
        />
      ) : (
        <p className="text-sm text-fg-muted">This account has no seller profile.</p>
      )}
    </Card>
  );
}
