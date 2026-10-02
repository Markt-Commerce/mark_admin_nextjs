import {
  Ban,
  CircleCheck,
  CircleDashed,
  CircleMinus,
  CirclePause,
  Clock,
  Flag,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  Star,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import type { MarketStatus, SellerVerificationStatus, UserStatus } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { MARKET_STATUS, SELLER_VERIFICATION, type Tone, USER_STATUS } from "@/lib/status";

const toneClass: Record<Tone, string> = {
  success: "bg-success-bg text-success-fg border-success-border",
  warning: "bg-warning-bg text-warning-fg border-warning-border",
  danger: "bg-danger-bg text-danger-fg border-danger-border",
  info: "bg-info-bg text-info-fg border-info-border",
  attention: "bg-attention-bg text-attention-fg border-attention-border",
  neutral: "bg-neutral-bg text-neutral-fg border-neutral-border",
  muted: "bg-muted-bg text-muted-fg border-border",
  brand: "bg-brand-subtle text-brand-strong border-brand/30",
};

/**
 * Small label. `pill` (rounded, tinted) is for state; `outline` (square-ish,
 * bordered) is used for the market axis so it never reads as the same thing
 * as the verification pill beside it.
 */
export function Badge({
  tone = "neutral",
  shape = "pill",
  icon,
  children,
  className,
  title,
}: {
  tone?: Tone;
  shape?: "pill" | "outline" | "chip";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap",
        shape === "pill" && "rounded-full border px-2.5 py-1",
        shape === "outline" && "rounded-md border border-dashed bg-surface px-2 py-1",
        shape === "chip" && "rounded-md border px-2 py-0.5 font-medium",
        toneClass[tone],
        shape === "outline" && "bg-surface",
        className,
      )}
    >
      {icon && <span aria-hidden className="[&>svg]:size-3.5">{icon}</span>}
      {children}
    </span>
  );
}

const USER_ICON: Record<UserStatus, ReactNode> = {
  active: <CircleCheck />,
  suspended: <CirclePause />,
  banned: <Ban />,
  deactivated: <CircleMinus />,
  deleted: <Trash2 />,
};

export function UserStatusPill({ status }: { status: UserStatus }) {
  const meta = USER_STATUS[status];
  return (
    <Badge tone={meta.tone} icon={USER_ICON[status]} title={meta.description}>
      {meta.label}
    </Badge>
  );
}

const VERIFICATION_ICON: Record<SellerVerificationStatus, ReactNode> = {
  unverified: <ShieldQuestion />,
  pending: <Clock />,
  verified: <ShieldCheck />,
  rejected: <ShieldX />,
  suspended: <ShieldAlert />,
};

/** Axis 1: KYC / trust verification. Solid pill with a shield icon. */
export function VerificationPill({ status }: { status: SellerVerificationStatus | null }) {
  if (!status) return <Badge tone="muted">No verification status</Badge>;
  const meta = SELLER_VERIFICATION[status];
  return (
    <Badge tone={meta.tone} icon={VERIFICATION_ICON[status]} title={meta.description}>
      {meta.label}
    </Badge>
  );
}

/** Axis 2: market verification. Outlined label with a map/flag icon. */
export function MarketPill({ status }: { status: MarketStatus | null }) {
  if (!status) return <Badge tone="muted" shape="outline">No market status</Badge>;
  const meta = MARKET_STATUS[status];
  return (
    <Badge
      tone={meta.tone}
      shape="outline"
      icon={status === "flagged" ? <Flag /> : <MapPin />}
      title={meta.description}
    >
      {meta.label}
    </Badge>
  );
}

/** Axis 3a: can the shop sell right now (`is_active`). */
export function SellingPill({ active }: { active: boolean }) {
  return active ? (
    <Badge tone="success" shape="chip" icon={<CircleCheck />}>
      Selling
    </Badge>
  ) : (
    <Badge tone="neutral" shape="chip" icon={<CircleDashed />} title="The shop can't sell. It was suspended, or the seller role was turned off.">
      Not selling
    </Badge>
  );
}

/** Axis 3b: editorial promotion (`is_featured`). */
export function FeaturedMark({ featured, withLabel }: { featured: boolean; withLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm" title={featured ? "Featured" : "Not featured"}>
      <Star
        aria-hidden
        className={cn("size-4", featured ? "fill-brand text-brand" : "text-border-strong")}
      />
      {withLabel ? (
        <span className={featured ? "font-medium text-fg" : "text-fg-muted"}>{featured ? "Featured" : "Not featured"}</span>
      ) : (
        <span className="sr-only">{featured ? "Featured" : "Not featured"}</span>
      )}
    </span>
  );
}

/** Role chip for the users table and profile card. */
export function RoleChip({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <Badge tone={tone} shape="chip">
      {children}
    </Badge>
  );
}
