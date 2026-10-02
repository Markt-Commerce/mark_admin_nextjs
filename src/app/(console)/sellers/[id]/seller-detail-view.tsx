"use client";

/* eslint-disable @next/next/no-img-element -- shop banners come from arbitrary CDN hosts */
import { ExternalLink, MoreHorizontal, MapPinned, PauseCircle, PlayCircle, ShieldCheck, ShieldX, Star, StarOff, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActionDialog } from "@/components/patterns/action-dialog";
import { DetailLayout } from "@/components/patterns/layout";
import { MaskedValue } from "@/components/patterns/masked-value";
import { ProfileCard } from "@/components/patterns/profile-card";
import { Avatar } from "@/components/ui/avatar";
import { FeaturedMark, MarketPill, SellingPill, VerificationPill } from "@/components/ui/badge";
import { Button, IconButton, circleIconClass } from "@/components/ui/button";
import { BackLink, Banner, DetailList } from "@/components/ui/surface";
import { DetailPanel, RecordFacts } from "@/components/patterns/detail-panel";
import { Menu, type MenuSection } from "@/components/ui/menu";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { type AdminSellerDetail, LIMITS } from "@/lib/api/types";
import { formatDateTime, formatRating, imageUrl, shopAddress } from "@/lib/format";
import { useMe } from "@/lib/me-context";
import { can } from "@/lib/permissions";
import { rejectSeller, sellerReasonAction, verifySeller } from "./actions";
import { MarketReviewDialog } from "./market-review-dialog";
import { PayoutDialog } from "./payout-dialog";

type DialogKey = "verify" | "reject" | "suspend" | "unsuspend" | "feature" | "unfeature" | "market" | "payout";

export function SellerDetailView({ initialSeller }: { initialSeller: AdminSellerDetail }) {
  const me = useMe();
  const toast = useToast();
  const [seller, setSeller] = useState(initialSeller);
  const [open, setOpen] = useState<DialogKey | null>(null);
  const close = () => setOpen(null);

  if (!me) return null;

  const name = seller.shop_name ?? `Seller ${seller.id}`;
  const applied = (message: string) => (next: AdminSellerDetail) => {
    setSeller(next);
    toast.success(message);
  };

  const canVerify = can(me, "seller.verify") && seller.verification_status !== "verified";
  const sections: MenuSection[] = [
    { label: "Verification", items: can(me, "seller.verify") && seller.verification_status !== "rejected" ? [
      { label: "Reject verification", icon: <ShieldX />, danger: true, onSelect: () => setOpen("reject") },
    ] : [] },
    { label: "Selling", items: can(me, "seller.suspend") ? [
      seller.is_active
        ? { label: "Suspend shop", icon: <PauseCircle />, danger: true, onSelect: () => setOpen("suspend") }
        : { label: "Unsuspend shop", icon: <PlayCircle />, onSelect: () => setOpen("unsuspend") },
    ] : [] },
    { label: "Promotion", items: can(me, "seller.feature") ? [
      seller.is_featured
        ? { label: "Remove from featured", icon: <StarOff />, onSelect: () => setOpen("unfeature") }
        : { label: "Feature shop", icon: <Star />, onSelect: () => setOpen("feature") },
    ] : [] },
  ];
  const anyAction = canVerify || can(me, "seller.market_review") || can(me, "seller.edit_payout") || sections.some((section) => section.items.length > 0);
  const identity = { name, subtitle: seller.shop_slug, avatar: <Avatar name={name} size="lg" /> };
  const canSeeOwner = can(me, "user.view");

  return (
    <>
      <DetailLayout
        back={<BackLink href="/sellers">Back to sellers</BackLink>}
        banners={
          <SellerBanners
            seller={seller}
            onUnsuspend={can(me, "seller.suspend") ? () => setOpen("unsuspend") : undefined}
            onReviewMarket={can(me, "seller.market_review") ? () => setOpen("market") : undefined}
          />
        }
        profile={
          <ProfileCard
            avatar={<Avatar name={name} size="xl" square />}
            name={name}
            subtitle={seller.shop_slug && <span className="font-mono text-xs">{seller.shop_slug}</span>}
            badges={
              <>
                <VerificationPill status={seller.verification_status} />
                <MarketPill status={seller.market_verification_status} />
                <SellingPill active={seller.is_active} />
                <FeaturedMark featured={seller.is_featured} withLabel />
              </>
            }
            actions={
              anyAction ? (
                <>
                  <div className="flex flex-wrap justify-center gap-2">
                    {can(me, "seller.market_review") && <IconButton shape="circle" label="Review market check" icon={<MapPinned className="size-4" />} onClick={() => setOpen("market")} />}
                    {can(me, "seller.edit_payout") && <IconButton shape="circle" label="Edit payout" icon={<Wallet className="size-4" />} onClick={() => setOpen("payout")} />}
                    <Menu label="More shop actions" trigger={<MoreHorizontal className="size-4" />} triggerClassName={circleIconClass} sections={sections} />
                  </div>
                  {canVerify && <Button fullWidth variant="primary" icon={<ShieldCheck className="size-4" />} onClick={() => setOpen("verify")}>Verify seller</Button>}
                </>
              ) : (
                <p className="text-sm text-fg-muted">Your role has no actions for this shop.</p>
              )
            }
          />
        }
        main={
          <DetailPanel>
            <Tabs
              label="Shop information"
              items={[
                { id: "shop", label: "Shop", content: <ShopDetails seller={seller} /> },
                { id: "verification", label: "Verification", content: <VerificationDetails seller={seller} /> },
              ]}
            />
          </DetailPanel>
        }
        aside={
          <>
            <OwnerCard seller={seller} canSeeOwner={canSeeOwner} />
            <PayoutCard seller={seller} canEdit={can(me, "seller.edit_payout")} onEdit={() => setOpen("payout")} />
            <MarketCard seller={seller} />
          </>
        }
      />

      <ActionDialog
        identity={identity}
        open={open === "verify"}
        onClose={close}
        title="Verify seller"
        description={<>Marks <strong>{name}</strong> as verified. The note is shown to reviewers as the reason for this status.</>}
        confirmLabel="Verify seller"
        reason={{ mode: "optional", label: "Note", maxLength: LIMITS.verifyNote, placeholder: "For example: documents checked against CAC registration." }}
        onConfirm={(note) => verifySeller(seller.id, note)}
        onSuccess={applied("Seller verified")}
      />
      <ActionDialog
        identity={identity}
        open={open === "reject"}
        onClose={close}
        title="Reject verification"
        description={<>Rejects <strong>{name}</strong>&apos;s verification. The reason is stored as the shop&apos;s verification note.</>}
        confirmLabel="Reject verification"
        tone="danger"
        reason={{ mode: "required", maxLength: LIMITS.rejectReason, hint: "Required. Say what failed and what the seller needs to fix." }}
        onConfirm={(reason) => rejectSeller(seller.id, reason ?? "")}
        onSuccess={applied("Verification rejected")}
      />
      <ActionDialog
        identity={identity}
        open={open === "suspend"}
        onClose={close}
        title="Suspend shop"
        description={<>Stops <strong>{name}</strong> selling on Markt.</>}
        consequences="This suspends the shop, not the owner's account: they can still sign in and shop. Verification status is kept."
        confirmLabel="Suspend shop"
        tone="danger"
        reason={{ mode: "optional", maxLength: LIMITS.reason, placeholder: "Why is this shop being suspended?" }}
        onConfirm={(reason) => sellerReasonAction(seller.id, "suspend", reason)}
        onSuccess={applied("Shop suspended")}
      />
      <ActionDialog
        identity={identity}
        open={open === "unsuspend"}
        onClose={close}
        title="Unsuspend shop"
        description={<>Lets <strong>{name}</strong> sell on Markt again.</>}
        confirmLabel="Unsuspend shop"
        reason={{ mode: "optional", maxLength: LIMITS.reason }}
        onConfirm={(reason) => sellerReasonAction(seller.id, "unsuspend", reason)}
        onSuccess={applied("Shop can sell again")}
      />
      <ActionDialog
        identity={identity}
        open={open === "feature"}
        onClose={close}
        title="Feature shop"
        description={<>Promotes <strong>{name}</strong> in featured placements.</>}
        confirmLabel="Feature shop"
        reason={{ mode: "optional", maxLength: LIMITS.reason }}
        onConfirm={(reason) => sellerReasonAction(seller.id, "feature", reason)}
        onSuccess={applied("Shop featured")}
      />
      <ActionDialog
        identity={identity}
        open={open === "unfeature"}
        onClose={close}
        title="Remove from featured"
        description={<>Takes <strong>{name}</strong> out of featured placements.</>}
        confirmLabel="Remove from featured"
        reason={{ mode: "optional", maxLength: LIMITS.reason }}
        onConfirm={(reason) => sellerReasonAction(seller.id, "unfeature", reason)}
        onSuccess={applied("Shop removed from featured")}
      />
      <MarketReviewDialog open={open === "market"} onClose={close} seller={seller} onSaved={applied("Market check updated")} />
      <PayoutDialog open={open === "payout"} onClose={close} seller={seller} onSaved={applied("Payout details saved")} />
    </>
  );
}

function SellerBanners({
  seller,
  onUnsuspend,
  onReviewMarket,
}: {
  seller: AdminSellerDetail;
  onUnsuspend?: () => void;
  onReviewMarket?: () => void;
}) {
  const banners = [];
  if (seller.verification_status === "rejected") {
    banners.push(
      <Banner key="rejected" tone="danger" title="Verification rejected">
        {seller.verification_note ?? "No reason was recorded."}
      </Banner>,
    );
  }
  if (seller.verification_status === "suspended") {
    banners.push(
      <Banner key="ver-suspended" tone="warning" title="Verification suspended">
        {seller.verification_note ?? "No note was recorded."}
      </Banner>,
    );
  }
  if (!seller.is_active) {
    banners.push(
      <Banner
        key="selling"
        tone="warning"
        title="This shop can't sell right now"
        actions={onUnsuspend && <Button icon={<PlayCircle className="size-4" />} onClick={onUnsuspend}>Unsuspend shop</Button>}
      >
        Staff suspended the shop, or the owner&apos;s seller role was turned off. The owner&apos;s own account isn&apos;t affected.
      </Banner>,
    );
  }
  if (seller.market_verification_status === "flagged") {
    banners.push(
      <Banner
        key="flagged"
        tone="warning"
        title="Market check flagged"
        actions={onReviewMarket && <Button icon={<MapPinned className="size-4" />} onClick={onReviewMarket}>Review market check</Button>}
      >
        The shop&apos;s location doesn&apos;t match the market it claims. Check the address and coordinates below.
      </Banner>,
    );
  }
  return banners.length ? <>{banners}</> : null;
}

function ShopDetails({ seller }: { seller: AdminSellerDetail }) {
  const banner = imageUrl(seller.banner_url);
  const rating = formatRating(seller.total_rating, seller.total_raters);
  return (
    <div className="flex flex-col gap-5">
      {banner && <img src={banner} alt={`${seller.shop_name ?? "Shop"} banner`} className="aspect-[3/1] w-full rounded-lg object-cover" />}
      <DetailList
        items={[
          { label: "Seller ID", value: <span className="font-mono">{seller.id}</span> },
          { label: "Shop name", value: seller.shop_name },
          { label: "Shop handle", value: seller.shop_slug && <span className="font-mono">{seller.shop_slug}</span> },
          { label: "Description", value: seller.description && <p className="whitespace-pre-line">{seller.description}</p> },
          {
            label: "Rating",
            value: rating ? `${rating} from ${seller.total_raters} rating${seller.total_raters === 1 ? "" : "s"}` : "No ratings yet",
          },
          { label: "Joined", value: formatDateTime(seller.created_at) },
          { label: "Policies", value: <Policies value={seller.policies} /> },
        ]}
      />
    </div>
  );
}

/** `policies` is free JSON: show a flat object as rows, anything else as-is. */
function Policies({ value }: { value: unknown }) {
  if (value == null || (typeof value === "object" && Object.keys(value as object).length === 0)) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.every(([, v]) => ["string", "number", "boolean"].includes(typeof v))) {
      return (
        <dl className="flex flex-col gap-1">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="capitalize text-fg-muted">{k.replace(/_/g, " ")}:</dt>
              <dd>{String(v)}</dd>
            </div>
          ))}
        </dl>
      );
    }
  }
  return <pre className="overflow-x-auto rounded-md bg-surface-muted p-3 font-mono text-xs">{JSON.stringify(value, null, 2)}</pre>;
}

function VerificationDetails({ seller }: { seller: AdminSellerDetail }) {
  return (
    <RecordFacts items={[
      { label: "Seller verification", icon: <ShieldCheck />, value: <VerificationPill status={seller.verification_status} />, note: seller.verification_note },
      { label: "Market check", icon: <MapPinned />, value: <MarketPill status={seller.market_verification_status} /> },
      { label: "Selling", icon: <PlayCircle />, value: <SellingPill active={seller.is_active} /> },
      { label: "Promotion", icon: <Star />, value: <FeaturedMark featured={seller.is_featured} withLabel /> },
    ]} />
  );
}

function OwnerCard({ seller, canSeeOwner }: { seller: AdminSellerDetail; canSeeOwner: boolean }) {
  return (
    <DetailPanel
      title="Owner"
      actions={
        seller.user_id && canSeeOwner ? (
          <Link
            href={`/users/${encodeURIComponent(seller.user_id)}`}
            className="inline-flex min-h-control items-center rounded-md px-2 text-sm font-semibold text-brand-strong hover:underline"
          >
            Open user
          </Link>
        ) : undefined
      }
    >
      <DetailList className="[&>div]:grid-cols-1 [&>div]:gap-1"
        items={[
          { label: "Username", value: seller.username },
          { label: "Email", value: seller.email },
          { label: "User ID", value: seller.user_id && <span className="font-mono">{seller.user_id}</span> },
        ]}
      />
    </DetailPanel>
  );
}

/**
 * Bank details, masked by default. Only operators who can edit payouts
 * get the reveal control and the editor.
 */
function PayoutCard({ seller, canEdit, onEdit }: { seller: AdminSellerDetail; canEdit: boolean; onEdit: () => void }) {
  const payout = seller.payout;
  const number = payout?.account_number ?? null;
  return (
    <DetailPanel
      title="Payout"
      description="Where this shop's earnings are paid."
      actions={
        canEdit ? (
          <Button icon={<Wallet className="size-4" />} onClick={onEdit}>
            Edit payout
          </Button>
        ) : undefined
      }
    >
      <DetailList className="[&>div]:grid-cols-1 [&>div]:gap-1"
        items={[
          { label: "Bank code", value: payout?.bank_code },
          {
            label: "Account number",
            value: canEdit ? (
              <MaskedValue value={number} label="account number" />
            ) : number ? (
              <span className="font-mono tabular-nums">•••• {number.slice(-4)}</span>
            ) : null,
          },
          { label: "Account name", value: payout?.account_name },
          { label: "Paystack subaccount", value: payout?.paystack_subaccount_code && <span className="font-mono text-xs">{payout.paystack_subaccount_code}</span> },
        ]}
      />
    </DetailPanel>
  );
}

function MarketCard({ seller }: { seller: AdminSellerDetail }) {
  const market = seller.market;
  const address = shopAddress(market?.shop_address);
  const lat = market?.shop_latitude;
  const lng = market?.shop_longitude;
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  return (
    <DetailPanel title="Market and location">
      <DetailList className="[&>div]:grid-cols-1 [&>div]:gap-1"
        items={[
          { label: "Market ID", value: market?.market_id != null ? <span className="font-mono">{market.market_id}</span> : null },
          { label: "Address", value: address.line },
          { label: "City", value: address.city },
          { label: "State", value: address.state },
          {
            label: "Coordinates",
            value: hasCoords ? <span className="font-mono text-xs">{lat.toFixed(5)}, {lng.toFixed(5)}</span> : null,
          },
        ]}
      />
      {hasCoords && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-control items-center gap-1.5 rounded-md text-sm font-semibold text-brand-strong hover:underline"
        >
          Open in maps
          <ExternalLink aria-hidden className="size-4" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </DetailPanel>
  );
}
