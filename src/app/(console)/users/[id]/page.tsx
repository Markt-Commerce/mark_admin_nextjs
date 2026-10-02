import type { Metadata } from "next";
import { NoPermission } from "@/components/shell/no-permission";
import { ButtonLink } from "@/components/ui/button";
import { BackLink, Banner } from "@/components/ui/surface";
import type { AdminUserDetail } from "@/lib/api/types";
import { adminGet, getMe } from "@/lib/dal";
import { can } from "@/lib/permissions";
import { UserDetailView } from "./user-detail-view";

export async function generateMetadata({ params }: PageProps<"/users/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `User ${decodeURIComponent(id)}` };
}

export default async function UserDetailPage({ params }: PageProps<"/users/[id]">) {
  const me = await getMe();
  if (!can(me, "user.view")) return <NoPermission what="users" />;

  const { id } = await params;
  const result = await adminGet<AdminUserDetail>(`/admin/users/${encodeURIComponent(decodeURIComponent(id))}`);

  if (!result.ok) {
    const missing = result.error.status === 404;
    return (
      <div className="flex flex-col gap-5">
        <BackLink href="/users">Back to users</BackLink>
        <Banner
          tone={missing ? "info" : "danger"}
          title={missing ? "This user doesn't exist" : "This user couldn't be loaded"}
          actions={!missing && <ButtonLink href={`/users/${id}`}>Try again</ButtonLink>}
        >
          {missing ? "The ID may be wrong, or the account may have been removed." : result.error.message}
        </Banner>
      </div>
    );
  }

  return <UserDetailView initialUser={result.data} />;
}
