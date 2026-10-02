import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ActionDialog } from "@/components/patterns/action-dialog";
import { Menu } from "@/components/ui/menu";

function MenuDialog() {
  const [open, setOpen] = useState(false);
  return <>
    <Menu label="More actions" trigger="…" sections={[
      { label: "Hidden group", items: [] },
      { label: "Access", items: [{ label: "Suspend user", onSelect: () => setOpen(true) }] },
    ]} />
    <ActionDialog open={open} onClose={() => setOpen(false)} title="Suspend user" description="Temporarily blocks sign-in." confirmLabel="Suspend user" reason={{ mode: "optional", maxLength: 255 }} onConfirm={async () => ({ ok: true, data: null })} onSuccess={() => {}} />
  </>;
}

describe("record actions and dialogs", () => {
  it("returns focus to the persistent menu button after Cancel and Escape", async () => {
    const user = userEvent.setup();
    render(<MenuDialog />);
    const trigger = screen.getByRole("button", { name: "More actions" });
    for (const method of ["cancel", "escape"]) {
      trigger.focus();
      await user.keyboard("{ArrowDown}");
      const item = screen.getByRole("menuitem", { name: "Suspend user" });
      expect(document.activeElement).toBe(item);
      await user.keyboard("{Enter}");
      const dialog = screen.getByRole("dialog");
      expect(document.activeElement).toBe(within(dialog).getByRole("textbox"));
      expect(screen.queryByRole("menu")).toBeNull();
      if (method === "cancel") await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
      else fireEvent(dialog, new Event("cancel", { cancelable: true }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(document.activeElement).toBe(trigger);
    }
  });

  it("requires a trimmed rejection reason and keeps API errors in the dialog", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn().mockResolvedValue({ ok: false, error: { status: 422, message: "Please explain what failed." } });
    const close = vi.fn();
    render(<ActionDialog open onClose={close} title="Reject verification" description="Rejects this shop." confirmLabel="Reject verification" reason={{ mode: "required", maxLength: 500 }} onConfirm={confirm} onSuccess={vi.fn()} />);
    const submit = screen.getByRole("button", { name: "Reject verification" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    await user.type(screen.getByRole("textbox"), "   ");
    expect(submit.disabled).toBe(true);
    await user.type(screen.getByRole("textbox"), "Missing registration");
    await user.click(submit);
    expect(confirm).toHaveBeenCalledWith("Missing registration");
    expect(await screen.findByText("Please explain what failed.")).toBeTruthy();
    expect(close).not.toHaveBeenCalled();
  });

  it("keeps the dialog open and blocks duplicate clicks while saving", async () => {
    const user = userEvent.setup();
    let finish!: (value: { ok: true; data: null }) => void;
    const confirm = vi.fn(() => new Promise<{ ok: true; data: null }>((resolve) => { finish = resolve; }));
    const close = vi.fn();
    const success = vi.fn();
    render(<ActionDialog open onClose={close} title="Verify seller" description="Verifies this shop." confirmLabel="Verify seller" onConfirm={confirm} onSuccess={success} />);
    const submit = screen.getByRole("button", { name: "Verify seller" }) as HTMLButtonElement;
    await user.click(submit);
    expect(submit.disabled).toBe(true);
    await user.click(submit);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();
    finish({ ok: true, data: null });
    await waitFor(() => expect(success).toHaveBeenCalledWith(null));
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard navigation across empty menu sections", async () => {
    const user = userEvent.setup();
    render(<Menu label="Actions" trigger="…" sections={[
      { label: "Empty", items: [] },
      { label: "Account", items: [{ label: "Edit", onSelect: vi.fn() }, { label: "Suspend", onSelect: vi.fn() }] },
    ]} />);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Suspend" }));
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Edit" }));
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Actions" }));
  });
});
