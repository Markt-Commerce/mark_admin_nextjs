import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserDetailView } from "@/app/(console)/users/[id]/user-detail-view";
import { setStaffRole } from "@/app/(console)/users/[id]/actions";
import { MeProvider } from "@/lib/me-context";
import { ToastProvider } from "@/components/ui/toast";
import { CAPABILITIES } from "@/lib/staff-roles";
import { PERMISSIONS, type AdminMe, type AdminUserDetail } from "@/lib/api/types";

vi.mock("@/app/(console)/users/[id]/actions", () => ({
  resendVerification: vi.fn(), userReasonAction: vi.fn(), verifyEmail: vi.fn(),
  editProfile: vi.fn(), uploadProfilePicture: vi.fn(), setRoles: vi.fn(), setStaffRole: vi.fn(),
}));

const superAdmin: AdminMe = {
  user_id: "operator", email: "owner@example.test", is_admin: false, is_super_admin: true,
  admin_role: "super_admin", permissions: [...PERMISSIONS],
};
const customer: AdminUserDetail = {
  id: "customer-1", email: "customer@example.test", username: "customer", phone_number: null,
  profile_picture: null, is_buyer: true, is_seller: false, is_admin: false, admin_role: null,
  email_verified: true, status: "active", created_at: "2026-10-01T09:00:00Z", last_login_at: null,
  is_active: true, suspension_reason: null, ban_reason: null, suspended_at: null, banned_at: null,
  deactivated_at: null, deleted_at: null, buyer: null, seller: null,
};

function show(record: AdminUserDetail, me = superAdmin) {
  return render(<MeProvider me={me}><ToastProvider><UserDetailView initialUser={record} /></ToastProvider></MeProvider>);
}

async function openDrawer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "More user actions" }));
  await user.click(screen.getByRole("menuitem", { name: "Change staff role" }));
  return screen.getByRole("dialog", { name: "Staff role" });
}

describe("staff role drawer", () => {
  it("gives a customer a staff role and shows the API's answer", async () => {
    const user = userEvent.setup();
    vi.mocked(setStaffRole).mockResolvedValue({ ok: true, data: { ...customer, admin_role: "support" } });
    show(customer);
    const drawer = await openDrawer(user);

    const save = within(drawer).getByRole("button", { name: "Save staff role" });
    expect(save).toHaveProperty("disabled", true); // nothing changed yet
    await user.click(within(drawer).getByRole("radio", { name: "Support" }));
    await user.type(within(drawer).getByRole("textbox", { name: /Reason/ }), "  New hire  ");
    await user.click(save);

    expect(setStaffRole).toHaveBeenCalledWith("customer-1", "support", "New hire");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByText("Staff role updated")).toBeTruthy();
  });

  it("removes a staff role as null and warns first", async () => {
    const user = userEvent.setup();
    vi.mocked(setStaffRole).mockResolvedValue({ ok: true, data: customer });
    show({ ...customer, admin_role: "finance" });
    const drawer = await openDrawer(user);

    await user.click(within(drawer).getByRole("radio", { name: "Not staff" }));
    expect(within(drawer).getByText("They'll lose access to the console straight away")).toBeTruthy();
    await user.click(within(drawer).getByRole("button", { name: "Save staff role" }));
    expect(setStaffRole).toHaveBeenLastCalledWith("customer-1", null, undefined);
  });

  it("keeps API errors in the drawer", async () => {
    const user = userEvent.setup();
    vi.mocked(setStaffRole).mockResolvedValue({ ok: false, error: { status: 400, message: "Unban this account first" } });
    show(customer);
    const drawer = await openDrawer(user);
    await user.click(within(drawer).getByRole("radio", { name: "Catalog" }));
    await user.click(within(drawer).getByRole("button", { name: "Save staff role" }));
    expect(await within(drawer).findByText("Unban this account first")).toBeTruthy();
    expect(screen.getByRole("dialog", { name: "Staff role" })).toBeTruthy();
  });

  it("offers only removal for a banned account", async () => {
    const user = userEvent.setup();
    show({ ...customer, admin_role: "support", banned_at: "2026-10-02T09:00:00Z", status: "banned" });
    const drawer = await openDrawer(user);
    expect(within(drawer).getByRole("radio", { name: "Moderation" })).toHaveProperty("disabled", true);
    expect(within(drawer).getByRole("radio", { name: "Not staff" })).toHaveProperty("disabled", false);
  });

  it("isn't offered for a legacy full-access admin", async () => {
    const user = userEvent.setup();
    show({ ...customer, is_admin: true });
    await user.click(screen.getByRole("button", { name: "More user actions" }));
    expect(screen.queryByRole("menuitem", { name: "Change staff role" })).toBeNull();
  });

  it("compares every permission the console knows about", () => {
    expect(CAPABILITIES.map((c) => c.permission).sort()).toEqual([...PERMISSIONS].sort());
  });
});
