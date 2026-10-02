import { BadgeCheck, CircleDashed } from "lucide-react";
import type { Metadata } from "next";
import { ListPage, PageHeader } from "@/components/patterns/layout";
import { NoPermission } from "@/components/shell/no-permission";
import { Avatar } from "@/components/ui/avatar";
import { RoleChip, UserStatusPill } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
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
    <ListPage
      header={<PageHeader title="Users" description="Every Markt account: buyers, sellers and staff." />}
      search={<SearchBox pathname={PATH} params={params} label="Search users" placeholder="Search by email, username, ID or phone" />}
      filters={
        <FilterControl
          pathname={PATH}
          params={params}
          filters={[
            {
              name: "role",
              label: "Role",
              anyLabel: "All roles",
              options: USER_ROLE_FILTERS.map((r) => ({ value: r, label: ROLE_FILTER_LABEL[r] })),
            },
            {
              name: "status",
              label: "Account status",
              anyLabel: "All statuses",
              options: USER_STATUSES.map((s) => ({ value: s, label: USER_STATUS[s].label })),
            },
          ]}
        />
      }
    >
      <DataTable
        caption="Users"
        columns={COLUMNS}
        rows={result.ok ? result.data.items : []}
        rowKey={(u) => u.id}
        stickyLastColumn
        error={result.ok ? undefined : { message: result.error.message, action: <ButtonLink href={PATH}>Try again</ButtonLink> }}
        empty={
          result.ok && result.data.total_items > 0
            ? {
                title: "No users on this page",
                description: "The list has fewer pages than this.",
                action: <ButtonLink href={PATH}>Go to the first page</ButtonLink>,
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
    </ListPage>
  );
}

const COLUMNS: Column<AdminUserListItem>[] = [
  {
    key: "user",
    header: "User",
    cell: (u) => (
      <span className="flex items-center gap-3">
        <Avatar src={u.profile_picture} name={u.username ?? u.email} size="sm" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-fg">{u.username ?? <span className="text-fg-muted">No username</span>}</span>
          <span className="truncate text-fg-muted">{u.email}</span>
        </span>
      </span>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    className: "whitespace-nowrap",
    cell: (u) => u.phone_number ?? <Dash />,
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
    key: "email_verified",
    header: "Email",
    className: "whitespace-nowrap",
    cell: (u) =>
      u.email_verified ? (
        <span className="inline-flex items-center gap-1.5 text-success-fg">
          <BadgeCheck aria-hidden className="size-4" /> Verified
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-fg-muted">
          <CircleDashed aria-hidden className="size-4" /> Not verified
        </span>
      ),
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
    header: <span className="sr-only">Open</span>,
    className: "text-right",
    cell: (u) => (
      <ButtonLink href={`/users/${encodeURIComponent(u.id)}`} aria-label={`View ${u.username ?? u.email}`}>
        View
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
