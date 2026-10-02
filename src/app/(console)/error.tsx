"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Unexpected failure inside a console page. The shell stays usable. */
export default function ConsoleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger-fg">
        <CircleAlert aria-hidden className="size-6" />
      </span>
      <h1 className="text-xl font-semibold">This page couldn&apos;t be loaded</h1>
      <p className="text-sm text-fg-muted">
        Something went wrong while loading it. Try again, and if it keeps happening, report it with the time it
        happened.
      </p>
      <Button variant="primary" onClick={reset} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
