"use client";

import {
  Ban,
  BadgeCheck,
  CircleDashed,
  LogOut,
  MailCheck,
  CalendarDays,
  MoreHorizontal,
  Clock,
  UserRound,
  Pencil,
  PlayCircle,
  Send,
  ShieldCheck,
  ShieldOff,
  Undo2,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActionDialog } from "@/components/patterns/action-dialog";
import { DetailLayout } from "@/components/patterns/layout";
import { ProfileCard } from "@/components/patterns/profile-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge, MarketPill, RoleChip, SellingPill, UserStatusPill, VerificationPill } from "@/components/ui/badge";
import { Button, IconButton, circleIconClass } from "@/components/ui/button";
import { BackLink, Banner, DetailList } from "@/components/ui/surface";
import { DetailPanel, RecordFacts } from "@/components/patterns/detail-panel";
import { CopyButton } from "@/components/ui/copy-button";
import { Menu, type MenuSection } from "@/components/ui/menu";
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
import { StaffRoleDrawer } from "./staff-role-drawer";

type DialogKey =
  | "edit"
  | "roles"
  | "suspend"
  | "reinstate"
  | "ban"
  | "unban"
  | "force-logout"
  | "verify-email"
  | "resend"
  | "staff-role";

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

  const sections: MenuSection[] = [
    { label: "Email", items: allow("user.verify_email") && !user.email_verified ? [
      { label: "Mark email as verified", icon: <MailCheck />, onSelect: () => setOpen("verify-email") },
      { label: "Resend verification code", icon: <Send />, onSelect: () => setOpen("resend") },
    ] : [] },
    { label: "Roles and sessions", items: [
      ...(allow("user.manage_roles") ? [{ label: "Manage buyer and seller roles", icon: <UserCog />, onSelect: () => setOpen("roles") }] : []),
      // A legacy is_admin account has every permission whatever its role, so the API won't change it.
      ...(allow("user.manage_staff") && !user.is_admin ? [{ label: "Change staff role", icon: <ShieldCheck />, onSelect: () => setOpen("staff-role") }] : []),
      ...(allow("user.force_logout") ? [{ label: "Sign out everywhere", icon: <LogOut />, onSelect: () => setOpen("force-logout") }] : []),
    ] },
    { label: "Account access", items: [
      ...(allow("user.suspend") && !user.suspended_at && !user.banned_at ? [{ label: "Suspend user", icon: <ShieldOff />, danger: true, onSelect: () => setOpen("suspend") }] : []),
      ...(allow("user.ban") && !user.banned_at ? [{ label: "Ban user", icon: <Ban />, danger: true, onSelect: () => setOpen("ban") }] : []),
    ] },
  ];
  const anyAction = allow("user.edit") || sections.some((section) => section.items.length > 0);
  const identity = {
    name,
    subtitle: user.email,
    avatar: <Avatar src={user.profile_picture} name={name} size="lg" />,
  };
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
                <div className="flex flex-wrap justify-center gap-2">
                  {allow("user.edit") && <IconButton shape="circle" label="Edit profile" icon={<Pencil className="size-4" />} onClick={() => setOpen("edit")} />}
                  <Menu label="More user actions" trigger={<MoreHorizontal className="size-4" />} triggerClassName={circleIconClass} sections={sections} />
                </div>
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
          >
            <DetailList className="[&>div]:grid-cols-1 [&>div]:gap-1" items={[
              { label: "Email", value: <span className="flex flex-wrap items-center">{user.email}<CopyButton value={user.email} label="email" /></span> },
              { label: "Phone", value: user.phone_number },
              { label: "Joined", value: formatDateTime(user.created_at) },
            ]} />
          </ProfileCard>
        }
        main={
          <DetailPanel>
            <Tabs
              label="User information"
              items={[
                { id: "account", label: "Account", content: <AccountDetails user={user} /> },
                { id: "state", label: "Account state", content: <AccountState user={user} /> },
              ]}
            />
          </DetailPanel>
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
      <StaffRoleDrawer open={open === "staff-role"} onClose={close} user={user} onSaved={applied("Staff role updated")} />

      <ActionDialog
        identity={identity}
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
        identity={identity}
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
        identity={identity}
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
        identity={identity}
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
        identity={identity}
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
        identity={identity}
        open={open === "verify-email"}
        onClose={close}
        title="Mark email as verified"
        description={<>Marks <strong>{user.email}</strong> as verified without the user entering a code. Only do this after confirming they own the address.</>}
        confirmLabel="Mark as verified"
        onConfirm={() => verifyEmail(user.id)}
        onSuccess={applied("Email marked as verified")}
      />
      <ActionDialog
        identity={identity}
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
  return (
    <RecordFacts items={[
      { label: "Account created", icon: <CalendarDays />, value: formatDateTime(user.created_at) },
      { label: "Last sign-in", icon: <Clock />, value: formatDateTime(user.last_login_at) ?? "This user has not signed in yet." },
      { label: "Suspension", icon: <ShieldOff />, value: user.suspended_at ? `Suspended on ${formatDateTime(user.suspended_at)}` : "No suspension", note: user.suspension_reason },
      { label: "Ban", icon: <Ban />, value: user.banned_at ? `Banned on ${formatDateTime(user.banned_at)}` : "No ban", note: user.ban_reason },
      { label: "User's account setting", icon: <UserRound />, value: user.is_active ? "Active" : user.deactivated_at ? `Deactivated on ${formatDateTime(user.deactivated_at)}` : "Deactivated" },
      ...(user.deleted_at ? [{ label: "Account deleted", icon: <UserRound />, value: formatDateTime(user.deleted_at) }] : []),
    ]} />
  );
}

function BuyerPanel({ user }: { user: AdminUserDetail }) {
  const buyer = user.buyer;
  return (
    <DetailPanel title="Buyer profile">
      {buyer ? (
        <DetailList className="[&>div]:grid-cols-1 [&>div]:gap-1"
          items={[
            { label: "Buyer name", value: buyer.buyername },
            { label: "Profile", value: buyer.is_active ? <Badge tone="success" shape="chip">Active</Badge> : <Badge tone="neutral" shape="chip">Turned off</Badge> },
            { label: "Refunds go to", value: buyer.refund_preference === "wallet" ? "Markt wallet" : buyer.refund_preference === "card" ? "Original card" : buyer.refund_preference },
          ]}
        />
      ) : (
        <p className="text-sm text-fg-muted">This account has no buyer profile.</p>
      )}
    </DetailPanel>
  );
}

function SellerPanel({ user, canViewSellers }: { user: AdminUserDetail; canViewSellers: boolean }) {
  const seller = user.seller;
  return (
    <DetailPanel
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
        <DetailList className="[&>div]:grid-cols-1 [&>div]:gap-1"
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
    </DetailPanel>
  );
}
