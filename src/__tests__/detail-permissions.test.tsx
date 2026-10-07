import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserDetailView } from "@/app/(console)/users/[id]/user-detail-view";
import { SellerDetailView } from "@/app/(console)/sellers/[id]/seller-detail-view";
import { userReasonAction } from "@/app/(console)/users/[id]/actions";
import { rejectSeller } from "@/app/(console)/sellers/[id]/actions";
import { MeProvider } from "@/lib/me-context";
import { ToastProvider } from "@/components/ui/toast";
import { PERMISSIONS, type AdminMe, type AdminUserDetail, type AdminSellerDetail } from "@/lib/api/types";

vi.mock("@/app/(console)/users/[id]/actions", () => ({
  resendVerification: vi.fn(), userReasonAction: vi.fn(), verifyEmail: vi.fn(),
  editProfile: vi.fn(), uploadProfilePicture: vi.fn(), setRoles: vi.fn(), setStaffRole: vi.fn(),
}));
vi.mock("@/app/(console)/sellers/[id]/actions", () => ({
  rejectSeller: vi.fn(), sellerReasonAction: vi.fn(), verifySeller: vi.fn(),
  reviewMarket: vi.fn(), editPayout: vi.fn(),
}));

const customer: AdminUserDetail = {
  id: "customer-1", email: "customer@example.test", username: "customer", phone_number: null,
  profile_picture: null, is_buyer: true, is_seller: false, is_admin: false, admin_role: null,
  email_verified: false, status: "active", created_at: "2026-10-01T09:00:00Z", last_login_at: null,
  is_active: true, suspension_reason: null, ban_reason: null, suspended_at: null, banned_at: null,
  deactivated_at: null, deleted_at: null, buyer: null, seller: null,
};
const shop: AdminSellerDetail = {
  id: 1, user_id: customer.id, shop_name: "Example shop", shop_slug: "example-shop",
  is_active: true, is_featured: false, verification_status: "pending", market_verification_status: "unverified",
  email: customer.email, username: customer.username, total_rating: null, total_raters: null,
  created_at: customer.created_at, description: null, banner_url: null, policies: null,
  verification_note: null, market: null,
  payout: { bank_code: "058", account_number: "0123456789", account_name: "Example shop", paystack_subaccount_code: null },
};

// Expected permissions checked against markt_python/app/admin/permissions.py.
const roles: Array<{ role: string; permissions: string[]; userMenu: string[]; sellerMenu: string[] }> = [
  { role: "super_admin", permissions: [...PERMISSIONS], userMenu: ["Mark email as verified", "Resend verification code", "Manage buyer and seller roles", "Change staff role", "Sign out everywhere", "Suspend user", "Ban user"], sellerMenu: ["Reject verification", "Suspend shop", "Feature shop"] },
  { role: "support", permissions: ["user.view", "seller.view", "user.edit", "user.verify_email", "user.force_logout"], userMenu: ["Mark email as verified", "Resend verification code", "Sign out everywhere"], sellerMenu: [] },
  { role: "moderation", permissions: ["user.view", "seller.view", "user.suspend", "user.ban", "seller.suspend"], userMenu: ["Suspend user", "Ban user"], sellerMenu: ["Suspend shop"] },
  { role: "finance", permissions: ["user.view", "seller.view", "seller.edit_payout"], userMenu: [], sellerMenu: [] },
  { role: "catalog", permissions: ["user.view", "seller.view", "seller.verify", "seller.suspend", "seller.feature", "seller.market_review"], userMenu: [], sellerMenu: ["Reject verification", "Suspend shop", "Feature shop"] },
  { role: "logistics", permissions: ["user.view", "seller.view", "seller.market_review"], userMenu: [], sellerMenu: [] },
];

function operator(role: (typeof roles)[number]): AdminMe {
  return { user_id: "operator", email: "staff@example.test", is_admin: false, is_super_admin: role.role === "super_admin", admin_role: role.role, permissions: role.permissions };
}
function show(view: "user" | "seller", me: AdminMe, record = customer) {
  return render(<MeProvider me={me}><ToastProvider>
    {view === "user" ? <UserDetailView initialUser={record} /> : <SellerDetailView initialSeller={shop} />}
  </ToastProvider></MeProvider>);
}

describe("detail permissions", () => {
  it.each(roles)("shows exactly the user actions granted to $role", async (role) => {
    const user = userEvent.setup();
    show("user", operator(role));
    expect(!!screen.queryByRole("button", { name: "Edit profile" })).toBe(role.permissions.includes("user.edit"));
    const trigger = screen.queryByRole("button", { name: "More user actions" });
    expect(!!trigger).toBe(role.userMenu.length > 0);
    if (trigger) {
      await user.click(trigger);
      expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual(role.userMenu);
    }
  });

  it.each(roles)("shows exactly the seller actions granted to $role, with payout masked", async (role) => {
    const user = userEvent.setup();
    show("seller", operator(role));
    expect(!!screen.queryByRole("button", { name: "Verify seller" })).toBe(role.permissions.includes("seller.verify"));
    expect(!!screen.queryByRole("button", { name: "Review market check" })).toBe(role.permissions.includes("seller.market_review"));
    expect(screen.queryAllByRole("button", { name: "Edit payout" }).length > 0).toBe(role.permissions.includes("seller.edit_payout"));
    expect(screen.queryByText("0123456789")).toBeNull();
    const trigger = screen.queryByRole("button", { name: "More shop actions" });
    expect(!!trigger).toBe(role.sellerMenu.length > 0);
    if (trigger) {
      await user.click(trigger);
      expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual(role.sellerMenu);
    }
  });

  it.each([
    { label: "own account", target: { ...customer, id: "operator" }, role: roles[0] },
    { label: "staff account", target: { ...customer, admin_role: "finance" }, role: roles[1] },
    { label: "deleted account", target: { ...customer, deleted_at: "2026-10-02T09:00:00Z" }, role: roles[0] },
  ])("keeps actions hidden on a protected $label", ({ target, role }) => {
    show("user", operator(role), target);
    expect(screen.queryByRole("button", { name: "Edit profile" })).toBeNull();
    expect(screen.queryByRole("button", { name: "More user actions" })).toBeNull();
  });

  it("uses permissions rather than the role label to grant actions", () => {
    show("user", { ...operator(roles[0]), permissions: ["user.view"] });
    expect(screen.queryByRole("button", { name: "Edit profile" })).toBeNull();
    expect(screen.queryByRole("button", { name: "More user actions" })).toBeNull();
  });

  it("applies the suspend response and exposes reinstatement", async () => {
    const user = userEvent.setup();
    vi.mocked(userReasonAction).mockResolvedValueOnce({ ok: true, data: { ...customer, status: "suspended", suspended_at: "2026-10-02T09:00:00Z", suspension_reason: "Review needed" } });
    show("user", operator(roles[2]));
    await user.click(screen.getByRole("button", { name: "More user actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Suspend user" }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByRole("textbox"), "Review needed");
    await user.click(within(dialog).getByRole("button", { name: "Suspend user" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(userReasonAction).toHaveBeenCalledWith(customer.id, "suspend", "Review needed");
    expect(screen.getByRole("button", { name: "Reinstate user" })).toBeTruthy();
    expect(within(screen.getByRole("alert")).getByText("Review needed")).toBeTruthy();
  });

  it("requires a rejection reason then displays the returned seller status", async () => {
    const user = userEvent.setup();
    vi.mocked(rejectSeller).mockResolvedValueOnce({ ok: true, data: { ...shop, verification_status: "rejected", verification_note: "Missing documents" } });
    show("seller", operator(roles[4]));
    await user.click(screen.getByRole("button", { name: "More shop actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Reject verification" }));
    const dialog = screen.getByRole("dialog");
    const reject = within(dialog).getByRole("button", { name: "Reject verification" }) as HTMLButtonElement;
    expect(reject.disabled).toBe(true);
    await user.type(within(dialog).getByRole("textbox"), "Missing documents");
    await user.click(reject);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(rejectSeller).toHaveBeenCalledWith(shop.id, "Missing documents");
    expect(within(screen.getByRole("alert")).getByText("Verification rejected")).toBeTruthy();
    expect(within(screen.getByRole("alert")).getByText("Missing documents")).toBeTruthy();
  });
});
