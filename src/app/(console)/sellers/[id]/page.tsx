import type { Metadata } from "next";
import { NoPermission } from "@/components/shell/no-permission";
import { ButtonLink } from "@/components/ui/button";
import { BackLink, Banner } from "@/components/ui/surface";
import type { AdminSellerDetail } from "@/lib/api/types";
import { adminGet, getMe } from "@/lib/dal";
import { can } from "@/lib/permissions";
import { SellerDetailView } from "./seller-detail-view";

export async function generateMetadata({ params }: PageProps<"/sellers/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Seller ${id}` };
}

export default async function SellerDetailPage({ params }: PageProps<"/sellers/[id]">) {
  const me = await getMe();
  if (!can(me, "seller.view")) return <NoPermission what="sellers" />;

  const { id } = await params;
  const back = <BackLink href="/sellers">Back to sellers</BackLink>;

  // Seller IDs are integers (route /admin/sellers/<int:seller_id>).
  if (!/^\d+$/.test(id)) {
    return (
      <div className="flex flex-col gap-5">
        {back}
        <Banner tone="info" title="This seller doesn't exist">
          Seller IDs are numbers. Check the address and try again.
        </Banner>
      </div>
    );
  }

  const result = await adminGet<AdminSellerDetail>(`/admin/sellers/${id}`);
  if (!result.ok) {
    const missing = result.error.status === 404;
    return (
      <div className="flex flex-col gap-5">
        {back}
        <Banner
          tone={missing ? "info" : "danger"}
          title={missing ? "This seller doesn't exist" : "This seller couldn't be loaded"}
          actions={!missing && <ButtonLink href={`/sellers/${id}`}>Try again</ButtonLink>}
        >
          {missing ? "The ID may be wrong, or the shop may have been removed." : result.error.message}
        </Banner>
      </div>
    );
  }

  return <SellerDetailView initialSeller={result.data} />;
}
