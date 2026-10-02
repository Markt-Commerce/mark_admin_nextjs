import { cn } from "@/lib/cn";
import { MARK_PATH, MARK_VIEWBOX } from "./mark-path";

/**
 * Outline of the Markt mark, used as a faint, tilted watermark (reference
 * C's logo watermark). Decorative only.
 */
export function Watermark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={MARK_VIEWBOX} className={cn("pointer-events-none overflow-visible", className)}>
      <path d={MARK_PATH} fill="none" stroke="currentColor" strokeWidth={14} fillRule="evenodd" />
    </svg>
  );
}
