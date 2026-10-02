import { ChevronRight, Star } from "lucide-react";
import type { Metadata } from "next";
import { ListPanel } from "@/components/patterns/layout";
import { NoPermission } from "@/components/shell/no-permission";
import { Avatar } from "@/components/ui/avatar";
import { FeaturedMark, MarketPill, SellingPill, VerificationPill } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { FilterChips } from "@/components/ui/filter-chips";
import { FilterControl, SearchBox } from "@/components/ui/list-controls";
import { Pagination } from "@/components/ui/pagination";
import { type Column, DataTable } from "@/components/ui/table";
import {
  type AdminSellerListItem,
  MARKET_STATUSES,
  type Page,
  SELLER_VERIFICATION_STATUSES,
  type SellerVerificationStatus,
} from "@/lib/api/types";
import { adminGet, getMe } from "@/lib/dal";
import { formatDate, formatRating } from "@/lib/format";
import { can } from "@/lib/permissions";
import { bool, compact, oneOf, pageNumber, str } from "@/lib/search-params";
import { MARKET_STATUS, SELLER_VERIFICATION } from "@/lib/status";

export const metadata: Metadata = { title: "Sellers" };

const PER_PAGE = 20;
const PATH = "/sellers";
/** "Any verification status": distinguishable from "no choice yet" (pending). */
const ALL = "all";

/** Chip order: the review queue first, then the whole directory. */
const CHIP_ORDER: SellerVerificationStatus[] = ["verified", "rejected", "unverified", "suspended"];

function href(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams(compact(params)).toString();
  return qs ? `${PATH}?${qs}` : PATH;
}

export default async function SellersPage({ searchParams }: PageProps<"/sellers">) {
  const me = await getMe();
  if (!can(me, "seller.view")) return <NoPermission what="sellers" />;

  const sp = await searchParams;
  const q = str(sp, "q");
  const rawVerification = str(sp, "verification_status");
  // Reviewers land on the backlog: no choice means pending.
  const verification =
    rawVerification === ALL ? undefined : (oneOf(sp, "verification_status", SELLER_VERIFICATION_STATUSES) ?? "pending");
  const market = oneOf(sp, "market_status", MARKET_STATUSES);
  const isActive = bool(sp, "is_active");
  const isFeatured = bool(sp, "is_featured");
  const page = pageNumber(sp);

  // Params as shown in links and filter controls (with the default resolved).
  const params = compact({
    q,
    verification_status: verification ?? ALL,
    market_status: market,
    is_active: isActive,
    is_featured: isFeatured,
  });
  const apiQuery = compact({
    q,
    verification_status: verification,
    market_status: market,
    is_active: isActive,
    is_featured: isFeatured,
  });
  const others = { q, market_status: market, is_active: isActive, is_featured: isFeatured };
  const filtered = !!(q || market || isActive || isFeatured);
  const queue = verification === "pending";

  const result = await adminGet<Page<AdminSellerListItem>>("/admin/sellers", { ...apiQuery, page, per_page: PER_PAGE });

  return (
    <ListPanel
      title={queue ? "Sellers awaiting review" : "Sellers"}
      chips={
        <FilterChips
          label="Verification status"
          items={[
            {
              label: SELLER_VERIFICATION.pending.label,
              href: href({ ...others, verification_status: "pending" }),
              active: queue,
              tone: SELLER_VERIFICATION.pending.tone,
            },
            { label: "All shops", href: href({ ...others, verification_status: ALL }), active: verification === undefined },
            ...CHIP_ORDER.map((s) => ({
              label: SELLER_VERIFICATION[s].label,
              href: href({ ...others, verification_status: s }),
              active: verification === s,
              tone: SELLER_VERIFICATION[s].tone,
            })),
          ]}
        />
      }
      filters={
        <FilterControl
          pathname={PATH}
          params={params}
          keep={["q", "verification_status"]}
          filters={[
            {
              name: "market_status",
              label: "Market check",
              anyLabel: "Any market status",
              options: MARKET_STATUSES.map((s) => ({ value: s, label: MARKET_STATUS[s].label })),
            },
            {
              name: "is_active",
              label: "Selling",
              anyLabel: "Selling or not",
              options: [
                { value: "true", label: "Selling" },
                { value: "false", label: "Not selling" },
              ],
            },
            {
              name: "is_featured",
              label: "Featured",
              anyLabel: "Featured or not",
              options: [
                { value: "true", label: "Featured" },
                { value: "false", label: "Not featured" },
              ],
            },
          ]}
        />
      }
      search={<SearchBox pathname={PATH} params={params} label="Search sellers" placeholder="Search shop, handle or owner" />}
    >
      <DataTable
        caption={queue ? "Sellers waiting for verification review, newest first" : "Sellers"}
        columns={COLUMNS}
        rows={result.ok ? result.data.items : []}
        rowKey={(s) => s.id}
        minWidth="76rem"
        stickyLastColumn
        error={result.ok ? undefined : { message: result.error.message, action: <ButtonLink href={PATH}>Try again</ButtonLink> }}
        empty={
          result.ok && result.data.total_items > 0
            ? {
                title: "No sellers on this page",
                description: "The list has fewer pages than this.",
                action: <ButtonLink href={href(params)}>Go to the first page</ButtonLink>,
              }
            : queue && !filtered
              ? {
                  title: "The queue is clear",
                  description: "No shops are waiting for verification review.",
                  action: <ButtonLink href={href({ verification_status: ALL })}>View all shops</ButtonLink>,
                }
              : {
                  title: "No sellers match",
                  description: "Try a different search, or clear the filters.",
                  action: <ButtonLink href={href({ verification_status: ALL })}>Clear search and filters</ButtonLink>,
                }
        }
      />
      {result.ok && (
        <Pagination
          pathname={PATH}
          params={params}
          page={result.data.page}
          perPage={result.data.per_page}
          totalItems={result.data.total_items}
          totalPages={result.data.total_pages}
          noun="seller"
        />
      )}
    </ListPanel>
  );
}

const COLUMNS: Column<AdminSellerListItem>[] = [
  {
    key: "shop",
    header: "Shop",
    cell: (s) => (
      <span className="flex items-center gap-3">
        <Avatar name={s.shop_name} size="sm" square />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-fg">{s.shop_name ?? <span className="text-fg-muted">No shop name</span>}</span>
          {s.shop_slug && <span className="truncate text-xs text-fg-muted">{s.shop_slug}</span>}
        </span>
      </span>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    cell: (s) =>
      s.email ? (
        <span className="flex items-center gap-0.5">
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-fg">{s.username ?? <span className="text-fg-muted">No username</span>}</span>
            <span className="truncate text-xs text-fg-muted">{s.email}</span>
          </span>
          <CopyButton value={s.email} label="owner's email address" />
        </span>
      ) : (
        <span className="text-fg-muted">No owner</span>
      ),
  },
  { key: "verification", header: "Verification", cell: (s) => <VerificationPill status={s.verification_status} /> },
  { key: "market", header: "Market check", cell: (s) => <MarketPill status={s.market_verification_status} /> },
  { key: "selling", header: "Selling", cell: (s) => <SellingPill active={s.is_active} /> },
  { key: "featured", header: "Featured", className: "text-center", cell: (s) => <FeaturedMark featured={s.is_featured} /> },
  {
    key: "rating",
    header: "Rating",
    className: "whitespace-nowrap",
    cell: (s) => {
      const avg = formatRating(s.total_rating, s.total_raters);
      return avg ? (
        <span className="inline-flex items-center gap-1">
          <Star aria-hidden className="size-3.5 fill-fg-muted text-fg-muted" />
          <span className="font-medium">{avg}</span>
          <span className="text-fg-muted">({s.total_raters})</span>
        </span>
      ) : (
        <span className="text-fg-muted">No ratings</span>
      );
    },
  },
  {
    key: "created",
    header: "Joined",
    className: "whitespace-nowrap",
    cell: (s) => formatDate(s.created_at) ?? <span className="text-fg-muted">—</span>,
  },
  {
    key: "view",
    header: <span className="sr-only">Actions</span>,
    className: "text-right",
    cell: (s) => (
      <ButtonLink href={`/sellers/${s.id}`} variant="tinted" aria-label={`View ${s.shop_name ?? `seller ${s.id}`}`} className="gap-1 px-3">
        View <ChevronRight aria-hidden className="size-4" />
      </ButtonLink>
    ),
  },
];
