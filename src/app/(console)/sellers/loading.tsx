import { ListPanel } from "@/components/patterns/layout";
import { Skeleton } from "@/components/ui/surface";
import { TableSkeleton } from "@/components/ui/table";

export default function Loading() {
  return (
    <ListPanel
      title="Sellers"
      chips={<Skeleton className="h-control w-96 rounded-full" />}
      search={<Skeleton className="h-control w-72" />}
    >
      <TableSkeleton caption="sellers" columns={10} />
    </ListPanel>
  );
}
