import { PageHeader } from "@/components/patterns/layout";
import { Skeleton } from "@/components/ui/surface";
import { TableSkeleton } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users" description="Every Markt account: buyers, sellers and staff." />
      <div className="flex items-center justify-between">
        <Skeleton className="h-control w-full max-w-sm" />
        <Skeleton className="h-control w-28" />
      </div>
      <TableSkeleton caption="users" columns={8} />
    </div>
  );
}
