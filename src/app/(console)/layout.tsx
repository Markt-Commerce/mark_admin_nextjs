import { AppShell } from "@/components/shell/app-shell";
import { getMe } from "@/lib/dal";
import { MeProvider } from "@/lib/me-context";

/**
 * Every console page sits inside this shell. /admin/me is fetched once per
 * request (cached in the DAL); pages call getMe() again for their own
 * permission checks rather than trusting this layout.
 */
export default async function ConsoleLayout({ children }: LayoutProps<"/">) {
  const me = await getMe();
  return (
    <MeProvider me={me}>
      <AppShell me={me}>{children}</AppShell>
    </MeProvider>
  );
}
