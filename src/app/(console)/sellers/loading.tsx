import { PageHeader } from "@/components/patterns/layout";
import { Skeleton } from "@/components/ui/surface";
import { TableSkeleton } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <PageHeader title="Sellers" />
        <Skeleton className="h-12 w-64" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-control w-full max-w-sm" />
        <Skeleton className="h-control w-28" />
      </div>
      <TableSkeleton caption="sellers" columns={9} />
    </div>
  );
}
