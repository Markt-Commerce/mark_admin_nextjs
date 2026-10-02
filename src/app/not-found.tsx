import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-neutral-bg text-neutral-fg">
        <SearchX aria-hidden className="size-6" />
      </span>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-fg-muted">The address may be mistyped, or the record may have been removed.</p>
      <ButtonLink href="/" variant="primary" className="mt-2">
        Go to the console
      </ButtonLink>
    </main>
  );
}
