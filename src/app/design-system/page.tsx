/* eslint-disable @next/next/no-img-element -- static brand files */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { DetailPanel, RecordFacts } from "@/components/patterns/detail-panel";
import { CopyButton } from "@/components/ui/copy-button";
import { DetailLayout, PageHeader } from "@/components/patterns/layout";
import { MaskedValue } from "@/components/patterns/masked-value";
import { ProfileCard } from "@/components/patterns/profile-card";
import { Avatar } from "@/components/ui/avatar";
import {
  Badge,
  FeaturedMark,
  MarketPill,
  RoleChip,
  SellingPill,
  UserStatusPill,
  VerificationPill,
} from "@/components/ui/badge";
import { Button, ButtonLink, IconButton } from "@/components/ui/button";
import { Checkbox, describedBy, Field, Input, Select, Textarea, Toggle } from "@/components/ui/field";
import { FilterControl, SearchBox } from "@/components/ui/list-controls";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";
import { BackLink, Banner, Card, DetailList, Skeleton, Tooltip } from "@/components/ui/surface";
import { type Column, DataTable, TableSkeleton } from "@/components/ui/table";
import { MARKET_STATUSES, SELLER_VERIFICATION_STATUSES, USER_STATUSES } from "@/lib/api/types";
import { Ban, CircleHelp, Pencil, Trash2 } from "lucide-react";
import { DialogDemos, RecordActionsDemo, TabsDemo, ToastDemos } from "./demos";

export const metadata: Metadata = { title: "Design system" };

/**
 * Living reference for every token and component. Development only: it
 * returns 404 in production builds (owner decision, Phase 0 #7).
 */
export default async function DesignSystemPage({ searchParams }: PageProps<"/design-system">) {
  if (process.env.NODE_ENV === "production") notFound();
  const sp = (await searchParams) as Record<string, string | undefined>;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10">
      <PageHeader
        title="Markt admin design system"
        description="Every token and component the console is built from. Development only. Sample content on this page is illustrative and never appears in the console."
      />

      <Section title="Brand">
        <div className="flex flex-wrap items-end gap-10">
          <figure className="flex flex-col gap-2">
            <img src="/brand/markt-logo.svg" alt="Markt" className="h-16 w-auto" />
            <figcaption className="text-xs text-fg-muted">public/brand/markt-logo.svg (vector)</figcaption>
          </figure>
          <figure className="flex flex-col gap-2">
            <img src="/brand/markt-mark.svg" alt="Markt mark" className="h-16 w-auto" />
            <figcaption className="text-xs text-fg-muted">public/brand/markt-mark.svg</figcaption>
          </figure>
          <figure className="flex flex-col gap-2 rounded-lg bg-brand p-4">
            <img src="/brand/markt-logo.svg" alt="Markt on brand" className="h-12 w-auto brightness-0 invert" />
            <figcaption className="text-xs text-white">On brand surface (white)</figcaption>
          </figure>
        </div>
      </Section>

      <Section title="Colour" description="Brand is identity only. Actions use primary (near-black) or danger (crimson), so a destructive button never looks like the brand.">
        <SwatchGroup
          title="Brand and actions"
          swatches={[
            ["brand", "#e94c2a", "Logo, accents. Not for text (3.8:1)"],
            ["brand-strong", "#c93d1f", "Brand text and links (5.0:1)"],
            ["brand-subtle", "#fff5f2", "Brand tint"],
            ["primary", "#1c1c1c", "Safe main actions (17:1)"],
            ["danger", "#b42318", "Destructive actions only (6.6:1)"],
          ]}
        />
        <SwatchGroup
          title="Text and surfaces"
          swatches={[
            ["fg", "#111111", "Body text"],
            ["fg-muted", "#626c70", "Secondary text (5.4:1)"],
            ["page", "#f7f7f8", "Page background"],
            ["surface", "#ffffff", "Cards, tables"],
            ["surface-muted", "#f5f5f5", "Table header, brand secWhite"],
            ["border", "#e4e4e7", "Dividers"],
            ["border-strong", "#c9c9cf", "Control borders"],
          ]}
        />
        <SwatchGroup
          title="Status tones (text on tint, all ≥ 5:1)"
          swatches={[
            ["success", "#067647 / #ecfdf3", "Active, verified"],
            ["warning", "#93370d / #fffaeb", "Suspended"],
            ["danger", "#b42318 / #fef3f2", "Banned, rejected"],
            ["info", "#175cd3 / #eff8ff", "Pending review"],
            ["attention", "#b93815 / #fff4ed", "Market flagged"],
            ["neutral", "#475467 / #f2f4f7", "Deactivated, unverified"],
            ["muted", "#626c70 / #f9fafb", "Deleted"],
          ]}
        />
      </Section>

      <Section title="Typography" description="Livvic, from the Markt brand. Sentence case everywhere.">
        <div className="flex flex-col gap-3">
          <p className="text-2xl font-semibold">2xl · Page title</p>
          <p className="text-xl font-semibold">xl · Section heading</p>
          <p className="text-lg font-semibold">lg · Card and dialog title</p>
          <p className="text-base">base · Body text for longer descriptions</p>
          <p className="text-sm">sm · Default UI text, table cells, form labels</p>
          <p className="text-xs font-semibold text-fg-muted">xs · Badges, column headers</p>
          <p className="font-mono text-sm">mono · USR_7R6ESUHC, account numbers</p>
        </div>
      </Section>

      <Section title="Shape, depth and spacing">
        <div className="flex flex-wrap gap-6">
          {[
            ["rounded-sm", "sm 6px"],
            ["rounded-md", "md 8px · controls"],
            ["rounded-lg", "lg 12px · cards"],
            ["rounded-xl", "xl 16px · dialogs"],
          ].map(([cls, label]) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div className={`size-16 border border-border-strong bg-surface ${cls}`} />
              <span className="text-xs text-fg-muted">{label}</span>
            </div>
          ))}
          {[
            ["shadow-card", "card"],
            ["shadow-popover", "popover"],
            ["shadow-modal", "modal"],
          ].map(([cls, label]) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div className={`size-16 rounded-lg bg-surface ${cls}`} />
              <span className="text-xs text-fg-muted">{label}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 items-center">
              <div className="h-control w-16 rounded-md border border-dashed border-brand" />
            </div>
            <span className="text-xs text-fg-muted">control · 40px min target</span>
          </div>
        </div>
      </Section>

      <Section title="Buttons" description="Labels name what happens. Every button is at least 40px tall. Hover and keyboard focus are live: tab through this row.">
        <StateGrid
          rows={[
            ["Primary", <Button key="p" variant="primary">Save changes</Button>, <Button key="pd" variant="primary" disabled>Save changes</Button>, <Button key="pl" variant="primary" loading>Saving</Button>],
            ["Secondary", <Button key="s">Cancel</Button>, <Button key="sd" disabled>Cancel</Button>, <Button key="sl" loading>Loading</Button>],
            ["Danger", <Button key="d" variant="danger" icon={<Ban className="size-4" />}>Ban user</Button>, <Button key="dd" variant="danger" disabled>Ban user</Button>, <Button key="dl" variant="danger" loading>Banning</Button>],
            ["Danger outline", <Button key="do" variant="danger-outline" icon={<Ban className="size-4" />}>Ban user</Button>, <Button key="dod" variant="danger-outline" disabled>Ban user</Button>, <Button key="dol" variant="danger-outline" loading>Loading</Button>],
            ["Ghost", <Button key="g" variant="ghost" icon={<Pencil className="size-4" />}>Edit profile</Button>, <Button key="gd" variant="ghost" disabled>Edit profile</Button>, <Button key="gl" variant="ghost" loading>Loading</Button>],
          ]}
          headers={["Default", "Disabled", "Loading"]}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ButtonLink href="/design-system" variant="secondary">
            Button as link
          </ButtonLink>
          <IconButton label="Delete" icon={<Trash2 className="size-4" />} />
          <Spinner label="Loading" />
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-6 md:grid-cols-2">
          <Field id="ds-input" label="Username" hint="1 to 50 characters.">
            <Input id="ds-input" defaultValue="ada_0" {...describedBy("ds-input", { hint: true })} />
          </Field>
          <Field id="ds-input-err" label="Phone number" error="Phone number must be 20 characters or fewer.">
            <Input id="ds-input-err" defaultValue="+234 800 000 0000 0000" {...describedBy("ds-input-err", { error: true })} />
          </Field>
          <Field id="ds-input-dis" label="Email address" hint="Email can't be changed from the console.">
            <Input id="ds-input-dis" defaultValue="ada@example.test" disabled />
          </Field>
          <Field id="ds-select" label="Market status">
            <Select id="ds-select" defaultValue="flagged">
              <option value="unverified">Unverified</option>
              <option value="verified">Verified</option>
              <option value="flagged">Flagged</option>
            </Select>
          </Field>
          <Field id="ds-textarea" label="Reason" optional counter="38 / 255">
            <Textarea id="ds-textarea" defaultValue="Repeated chargebacks on recent orders." />
          </Field>
          <div className="flex flex-col">
            <Toggle label="Buyer role" description="Can shop on Markt." defaultChecked />
            <Toggle label="Seller role" description="Can sell on Markt." />
            <Toggle label="Disabled toggle" disabled />
            <Checkbox label="Checkbox" description="With a description line." defaultChecked />
            <Checkbox label="Disabled checkbox" disabled />
          </div>
        </div>
      </Section>

      <Section title="Status pills" description="Each axis has its own look. Seller verification is a solid pill with a shield; market verification is a dashed outline with a pin or flag.">
        <LabelledRow label="User status">
          {USER_STATUSES.map((s) => (
            <UserStatusPill key={s} status={s} />
          ))}
        </LabelledRow>
        <LabelledRow label="Seller verification">
          {SELLER_VERIFICATION_STATUSES.map((s) => (
            <VerificationPill key={s} status={s} />
          ))}
        </LabelledRow>
        <LabelledRow label="Market verification">
          {MARKET_STATUSES.map((s) => (
            <MarketPill key={s} status={s} />
          ))}
        </LabelledRow>
        <LabelledRow label="Selling and featured">
          <SellingPill active />
          <SellingPill active={false} />
          <FeaturedMark featured withLabel />
          <FeaturedMark featured={false} withLabel />
        </LabelledRow>
        <LabelledRow label="Role chips">
          <RoleChip>Buyer</RoleChip>
          <RoleChip>Seller</RoleChip>
          <RoleChip tone="brand">Super admin</RoleChip>
          <RoleChip tone="info">Support</RoleChip>
          <Badge tone="success" shape="chip">Email verified</Badge>
          <Badge tone="neutral" shape="chip">Email not verified</Badge>
        </LabelledRow>
      </Section>

      <Section title="Avatars" description="Real image when the backend has an http(s) URL; otherwise initials from the name. Shops are square.">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name="Ada Lovelace" size="sm" />
          <Avatar name="Ada Lovelace" size="md" />
          <Avatar name="Ada Lovelace" size="lg" />
          <Avatar name="Ada Lovelace" size="xl" />
          <Avatar name="Balogun Fabrics" size="md" square />
          <Avatar name="Balogun Fabrics" size="lg" square />
          <Avatar name="ada_0" src="default.jpg" />
        </div>
      </Section>

      <Section title="Banners">
        <div className="flex flex-col gap-3">
          <Banner tone="danger" title="Banned on 23 Sept 2026" actions={<Button>Unban user</Button>}>
            Sold counterfeit goods.
          </Banner>
          <Banner tone="warning" title="Suspended on 30 Sept 2026" actions={<Button>Reinstate user</Button>}>
            Chargeback under review.
          </Banner>
          <Banner tone="info" title="Deactivated by the user on 12 Sept 2026">
            The user chose to deactivate their account. Staff can&apos;t reverse this.
          </Banner>
          <Banner tone="success" title="Verified">Identity and business checks passed.</Banner>
        </div>
      </Section>

      <Section title="Cards, details and sensitive values">
        <div className="grid gap-5 md:grid-cols-2">
          <Card title="Payout" description="Bank details for settlements." actions={<Button>Edit payout</Button>}>
            <DetailList
              items={[
                { label: "Bank code", value: "058" },
                { label: "Account number", value: <MaskedValue value="0123456789" label="account number" /> },
                { label: "Account name", value: "Balogun Fabrics Ltd" },
                { label: "Paystack subaccount", value: null },
              ]}
            />
          </Card>
          <Card title="Loading card">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Table" description="Scrolls sideways instead of breaking the layout. Loading, empty and error states are built in.">
        <div className="flex flex-col gap-6">
          <DataTable caption="Sample rows" columns={SAMPLE_COLUMNS} rows={SAMPLE_ROWS} rowKey={(r) => r.id} minWidth="40rem" />
          <Pagination pathname="/design-system" params={{}} page={2} perPage={20} totalItems={132} totalPages={7} noun="user" />
          <DataTable
            caption="Empty"
            columns={SAMPLE_COLUMNS}
            rows={[]}
            rowKey={(r) => r.id}
            minWidth="40rem"
            empty={{ title: "No users match", description: "Try a different search or clear the filters.", action: <Button>Clear filters</Button> }}
          />
          <DataTable
            caption="Error"
            columns={SAMPLE_COLUMNS}
            rows={[]}
            rowKey={(r) => r.id}
            minWidth="40rem"
            error={{ message: "Couldn't reach the Markt API. Check your connection and try again.", action: <ButtonLink href="/design-system">Try again</ButtonLink> }}
          />
          <TableSkeleton caption="users" columns={5} rows={3} />
        </div>
      </Section>

      <Section title="Search and filters" description="Plain GET forms: they work without script and keep each other's values.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchBox pathname="/design-system" params={sp} label="Search users" placeholder="Search by email, username, ID or phone" />
          <FilterControl
            pathname="/design-system"
            params={sp}
            filters={[
              { name: "role", label: "Role", options: [{ value: "buyer", label: "Buyer" }, { value: "seller", label: "Seller" }] },
              { name: "status", label: "Status", options: USER_STATUSES.map((s) => ({ value: s, label: s })) },
            ]}
          />
        </div>
      </Section>

      <Section title="Tabs">
        <TabsDemo />
      </Section>

      <Section title="Dialogs" description="One modal shell for every popup: dimmed page, focus trapped inside, Escape closes, focus returns to the button that opened it. Every confirmation carries the audit notice.">
        <DialogDemos />
      </Section>

      <Section title="Toasts" description="Success toasts clear after 5 seconds. Error toasts stay until dismissed.">
        <ToastDemos />
      </Section>

      <Section title="Tooltip and back link">
        <div className="flex flex-wrap items-center gap-6">
          <Tooltip id="ds-tip" content="Last sign-in time, in Lagos time.">
            <button type="button" className="inline-flex min-h-control items-center gap-1.5 text-sm text-fg-muted">
              Last login <CircleHelp className="size-4" aria-hidden />
            </button>
          </Tooltip>
          <BackLink href="/design-system">Back to users</BackLink>
        </div>
      </Section>

      <Section title="Detail layout and profile card" description="Three columns at 1280px and wider; side panels drop under the main column below that.">
        <DetailLayout
          profile={
            <ProfileCard
              avatar={<Avatar name="Ada Lovelace" size="xl" />}
              name="ada_0"
              subtitle="ada@example.test"
              badges={
                <>
                  <UserStatusPill status="active" />
                  <RoleChip>Buyer</RoleChip>
                </>
              }
              actions={<RecordActionsDemo />}
            />
          }
          main={
            <DetailPanel title="Account state">
              <RecordFacts items={[
                { label: "Email verified", icon: <CircleHelp />, value: "Verified" },
                { label: "Suspension", icon: <Ban />, value: "No suspension" },
              ]} />
            </DetailPanel>
          }
          aside={
            <DetailPanel title="Buyer profile">
              <DetailList items={[{ label: "Name", value: "Ada Lovelace" }, { label: "Email", value: <span className="flex flex-wrap items-center">ada@example.test<CopyButton value="ada@example.test" label="sample email" /></span> }]} />
            </DetailPanel>
          }
        />
      </Section>
    </main>
  );
}

interface SampleRow {
  id: string;
  name: string;
  email: string;
  status: (typeof USER_STATUSES)[number];
}

const SAMPLE_ROWS: SampleRow[] = [
  { id: "1", name: "ada_0", email: "ada@example.test", status: "active" },
  { id: "2", name: "emeka_3", email: "emeka@example.test", status: "suspended" },
  { id: "3", name: "ifeoma_6", email: "ifeoma@example.test", status: "banned" },
];

const SAMPLE_COLUMNS: Column<SampleRow>[] = [
  {
    key: "user",
    header: "User",
    cell: (r) => (
      <span className="flex items-center gap-3">
        <Avatar name={r.name} size="sm" />
        <span className="flex flex-col">
          <span className="font-medium">{r.name}</span>
          <span className="text-fg-muted">{r.email}</span>
        </span>
      </span>
    ),
  },
  { key: "status", header: "Status", cell: (r) => <UserStatusPill status={r.status} /> },
  { key: "view", header: <span className="sr-only">Actions</span>, className: "text-right", cell: () => <ButtonLink href="/design-system">View</ButtonLink> },
];

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SwatchGroup({ title, swatches }: { title: string; swatches: Array<[string, string, string]> }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {swatches.map(([name, hex, use]) => {
          const [fg, bg] = hex.split(" / ");
          return (
            <div key={name} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex h-14 items-center justify-center text-sm font-semibold" style={{ background: bg ?? fg, color: bg ? fg : undefined }}>
                {bg ? "Aa" : null}
              </div>
              <div className="px-3 py-2">
                <p className="text-sm font-semibold">{name}</p>
                <p className="font-mono text-xs text-fg-muted">{hex}</p>
                <p className="mt-0.5 text-xs text-fg-muted">{use}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StateGrid({ headers, rows }: { headers: string[]; rows: Array<[string, ...ReactNode[]]> }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-left text-sm">
        <thead>
          <tr>
            <th className="pr-6 pb-2" />
            {headers.map((h) => (
              <th key={h} className="pr-6 pb-2 text-xs font-semibold text-fg-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, ...cells]) => (
            <tr key={label}>
              <th scope="row" className="py-1.5 pr-6 text-xs font-semibold text-fg-muted">
                {label}
              </th>
              {cells.map((c, i) => (
                <td key={i} className="py-1.5 pr-6">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LabelledRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p className="w-44 shrink-0 text-sm font-semibold text-fg-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
