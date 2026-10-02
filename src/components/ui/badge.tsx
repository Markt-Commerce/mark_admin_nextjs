import { Star } from "lucide-react";
import type { ReactNode } from "react";
import type { MarketStatus, SellerVerificationStatus, UserStatus } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { MARKET_STATUS, SELLER_VERIFICATION, type Tone, USER_STATUS } from "@/lib/status";

const tagTone: Record<Tone, string> = {
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-danger-bg text-danger-fg",
  info: "bg-info-bg text-info-fg",
  attention: "bg-attention-bg text-attention-fg",
  neutral: "bg-neutral-bg text-neutral-fg",
  muted: "bg-muted-bg text-muted-fg",
  brand: "bg-brand-subtle text-brand-strong",
};

const outlineTone: Record<Tone, string> = {
  success: "border-success-fg/60 text-success-fg",
  warning: "border-warning-fg/60 text-warning-fg",
  danger: "border-danger-fg/60 text-danger-fg",
  info: "border-info-fg/60 text-info-fg",
  attention: "border-attention-fg/60 text-attention-fg",
  neutral: "border-neutral-fg/50 text-neutral-fg",
  muted: "border-border-strong text-muted-fg",
  brand: "border-brand-strong/60 text-brand-strong",
};

export const dotTone: Record<Tone, string> = {
  success: "bg-success-fg",
  warning: "bg-warning-fg",
  danger: "bg-danger-fg",
  info: "bg-info-fg",
  attention: "bg-attention-fg",
  neutral: "bg-neutral-fg",
  muted: "bg-border-strong",
  brand: "bg-brand",
};

/**
 * Labels in the three shapes of reference A:
 * - `tag`: tinted, square-cornered ("Active Now"). Used for state.
 * - `outline`: coloured outline, rounded ("Finance"). Used for the market
 *   axis, so it never reads as the same thing as the verification tag.
 * - `chip`: grey outline, rounded ("Reports"). Used for roles.
 */
export function Badge({
  tone = "neutral",
  shape = "tag",
  children,
  className,
  title,
}: {
  tone?: Tone;
  shape?: "tag" | "outline" | "chip";
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center text-xs font-medium whitespace-nowrap",
        shape === "tag" && `rounded-md px-2 py-1 ${tagTone[tone]}`,
        shape === "outline" && `rounded-full border bg-surface px-2.5 py-0.5 ${outlineTone[tone]}`,
        shape === "chip" &&
          `rounded-full border bg-surface px-2.5 py-0.5 ${tone === "neutral" ? "border-border-strong text-fg" : outlineTone[tone]}`,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function UserStatusPill({ status }: { status: UserStatus }) {
  const meta = USER_STATUS[status];
  return (
    <Badge tone={meta.tone} title={meta.description}>
      {meta.label}
    </Badge>
  );
}

/** Axis 1: KYC / trust verification. Tinted tag. */
export function VerificationPill({ status }: { status: SellerVerificationStatus | null }) {
  if (!status) return <Badge tone="muted">No verification status</Badge>;
  const meta = SELLER_VERIFICATION[status];
  return (
    <Badge tone={meta.tone} title={meta.description}>
      {meta.label}
    </Badge>
  );
}

/** Axis 2: market verification. Coloured outline, like reference A's department tags. */
export function MarketPill({ status }: { status: MarketStatus | null }) {
  if (!status)
    return (
      <Badge tone="muted" shape="outline">
        No market status
      </Badge>
    );
  const meta = MARKET_STATUS[status];
  return (
    <Badge tone={meta.tone} shape="outline" title={meta.description}>
      {meta.label}
    </Badge>
  );
}

/** Axis 3a: can the shop sell right now (`is_active`). */
export function SellingPill({ active }: { active: boolean }) {
  return active ? (
    <Badge tone="success">Selling</Badge>
  ) : (
    <Badge tone="neutral" title="The shop can't sell. It was suspended, or the seller role was turned off.">
      Not selling
    </Badge>
  );
}

/** Axis 3b: editorial promotion (`is_featured`). */
export function FeaturedMark({ featured, withLabel }: { featured: boolean; withLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm" title={featured ? "Featured" : "Not featured"}>
      <Star aria-hidden className={cn("size-4", featured ? "fill-brand text-brand" : "text-border-strong")} />
      {withLabel ? (
        <span className={featured ? "font-medium text-fg" : "text-fg-muted"}>{featured ? "Featured" : "Not featured"}</span>
      ) : (
        <span className="sr-only">{featured ? "Featured" : "Not featured"}</span>
      )}
    </span>
  );
}

/** Role chip (reference A's permission chips). */
export function RoleChip({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <Badge tone={tone} shape="chip">
      {children}
    </Badge>
  );
}

/** Small coloured dot used in filter chips and legends. */
export function Dot({ tone }: { tone: Tone }) {
  return <span aria-hidden className={cn("inline-block size-2 shrink-0 rounded-full", dotTone[tone])} />;
}
