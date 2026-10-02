import { DetailLayout } from "./layout";
import { Card, Skeleton } from "@/components/ui/surface";

/** Placeholder for a detail page while its record loads. */
export function DetailSkeleton({ square }: { square?: boolean }) {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>
      <DetailLayout
        back={<Skeleton className="h-5 w-32" />}
        profile={
          <Card>
            <div className="flex flex-col items-center gap-3 py-2">
              <Skeleton className={square ? "size-24 rounded-lg" : "size-24 rounded-full"} />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="mt-4 h-control w-full" />
              <Skeleton className="h-control w-full" />
            </div>
          </Card>
        }
        main={
          <Card>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </Card>
        }
        aside={
          <Card>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        }
      />
    </div>
  );
}
