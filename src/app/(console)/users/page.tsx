import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { ListPanel } from "@/components/patterns/layout";
import { NoPermission } from "@/components/shell/no-permission";
import { Avatar } from "@/components/ui/avatar";
import { Badge, RoleChip, UserStatusPill } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { FilterChips } from "@/components/ui/filter-chips";
import { FilterControl, SearchBox } from "@/components/ui/list-controls";
import { Pagination } from "@/components/ui/pagination";
import { type Column, DataTable } from "@/components/ui/table";
import { type AdminUserListItem, type Page, USER_ROLE_FILTERS, USER_STATUSES } from "@/lib/api/types";
import { adminGet, getMe } from "@/lib/dal";
import { formatDate, formatDateTime } from "@/lib/format";
import { can } from "@/lib/permissions";
import { compact, oneOf, pageNumber, str } from "@/lib/search-params";
import { roleLabel, USER_STATUS } from "@/lib/status";

export const metadata: Metadata = { title: "Users" };

const PER_PAGE = 20;
const PATH = "/users";

const ROLE_FILTER_LABEL: Record<(typeof USER_ROLE_FILTERS)[number], string> = {
  buyer: "Buyers",
  seller: "Sellers",
  admin: "Full-access admins",
  staff: "Staff with an admin role",
};

function href(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams(compact(params)).toString();
  return qs ? `${PATH}?${qs}` : PATH;
}

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  const me = await getMe();
  if (!can(me, "user.view")) return <NoPermission what="users" />;

  const sp = await searchParams;
  const q = str(sp, "q");
  const role = oneOf(sp, "role", USER_ROLE_FILTERS);
  const status = oneOf(sp, "status", USER_STATUSES);
  const page = pageNumber(sp);
  const params = compact({ q, role, status });
  const filtered = Object.keys(params).length > 0;

  const result = await adminGet<Page<AdminUserListItem>>("/admin/users", { ...params, page, per_page: PER_PAGE });

  return (
    <ListPanel
      title="Users"
      chips={
        <FilterChips
          label="Account status"
          items={[
            { label: "All", href: href({ q, role }), active: !status },
            ...USER_STATUSES.map((s) => ({
              label: USER_STATUS[s].label,
              href: href({ q, role, status: s }),
              active: status === s,
              tone: USER_STATUS[s].tone,
            })),
          ]}
        />
      }
      filters={
        <FilterControl
          pathname={PATH}
          params={params}
          keep={["q", "status"]}
          filters={[
            {
              name: "role",
              label: "Role",
              anyLabel: "All roles",
              options: USER_ROLE_FILTERS.map((r) => ({ value: r, label: ROLE_FILTER_LABEL[r] })),
            },
          ]}
        />
      }
      search={<SearchBox pathname={PATH} params={params} label="Search users" placeholder="Search by email, name, ID or phone" />}
    >
      <DataTable
        caption="Users"
        columns={COLUMNS}
        rows={result.ok ? result.data.items : []}
        rowKey={(u) => u.id}
        stickyLastColumn
        minWidth="68rem"
        error={result.ok ? undefined : { message: result.error.message, action: <ButtonLink href={PATH}>Try again</ButtonLink> }}
        empty={
          result.ok && result.data.total_items > 0
            ? {
                title: "No users on this page",
                description: "The list has fewer pages than this.",
                action: <ButtonLink href={href(params)}>Go to the first page</ButtonLink>,
              }
            : filtered
              ? {
                  title: "No users match",
                  description: "Try a different search, or clear the filters.",
                  action: <ButtonLink href={PATH}>Clear search and filters</ButtonLink>,
                }
              : { title: "No users yet", description: "Accounts appear here as people sign up to Markt." }
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
          noun="user"
        />
      )}
    </ListPanel>
  );
}

const COLUMNS: Column<AdminUserListItem>[] = [
  {
    key: "user",
    header: "User",
    cell: (u) => (
      <span className="flex items-center gap-3">
        <Avatar src={u.profile_picture} name={u.username ?? u.email} size="sm" />
        <span className="truncate font-medium text-fg">{u.username ?? <span className="text-fg-muted">No username</span>}</span>
      </span>
    ),
  },
  {
    key: "email",
    header: "Email",
    cell: (u) => (
      <span className="flex items-center gap-0.5">
        <span className="truncate">{u.email}</span>
        <CopyButton value={u.email} label="email address" />
      </span>
    ),
  },
  {
    key: "verified",
    header: "Email check",
    cell: (u) => (u.email_verified ? <Badge tone="success">Verified</Badge> : <Badge tone="neutral">Not verified</Badge>),
  },
  {
    key: "roles",
    header: "Roles",
    cell: (u) => {
      const staff = roleLabel(u.admin_role);
      const chips = [
        u.is_buyer && <RoleChip key="b">Buyer</RoleChip>,
        u.is_seller && <RoleChip key="s">Seller</RoleChip>,
        u.is_admin && (
          <RoleChip key="a" tone="brand">
            Admin
          </RoleChip>
        ),
        staff && (
          <RoleChip key="r" tone={u.admin_role === "super_admin" ? "brand" : "info"}>
            {staff}
          </RoleChip>
        ),
      ].filter(Boolean);
      return chips.length ? <span className="flex flex-wrap gap-1">{chips}</span> : <Dash label="No roles" />;
    },
  },
  {
    key: "phone",
    header: "Phone",
    className: "whitespace-nowrap",
    cell: (u) => u.phone_number ?? <Dash />,
  },
  { key: "status", header: "Status", cell: (u) => <UserStatusPill status={u.status} /> },
  {
    key: "created",
    header: "Joined",
    className: "whitespace-nowrap",
    cell: (u) => formatDate(u.created_at) ?? <Dash />,
  },
  {
    key: "last_login",
    header: "Last sign-in",
    className: "whitespace-nowrap",
    cell: (u) => formatDateTime(u.last_login_at) ?? <span className="text-fg-muted">Never</span>,
  },
  {
    key: "view",
    header: <span className="sr-only">Actions</span>,
    className: "text-right",
    cell: (u) => (
      <ButtonLink
        href={`/users/${encodeURIComponent(u.id)}`}
        variant="tinted"
        aria-label={`View ${u.username ?? u.email}`}
        className="gap-1 px-3"
      >
        View <ChevronRight aria-hidden className="size-4" />
      </ButtonLink>
    ),
  },
];

function Dash({ label = "Not set" }: { label?: string }) {
  return (
    <span className="text-fg-muted" aria-label={label}>
      —
    </span>
  );
}
