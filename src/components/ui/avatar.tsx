/* eslint-disable @next/next/no-img-element -- avatars come from arbitrary CDN hosts */
import { cn } from "@/lib/cn";
import { imageUrl, initials } from "@/lib/format";

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
} as const;

/**
 * Picture when the backend has a real image URL, otherwise initials from
 * `name`. Initials are derived from a real field, never placeholder art.
 */
export function Avatar({
  src,
  name,
  size = "md",
  square,
  className,
}: {
  src?: string | null;
  name: string | null | undefined;
  size?: keyof typeof sizes;
  /** Square corners for shops, round for people. */
  square?: boolean;
  className?: string;
}) {
  const url = imageUrl(src);
  const shape = square ? "rounded-lg" : "rounded-full";
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={cn("shrink-0 bg-surface-muted object-cover", shape, sizes[size], className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-brand-subtle font-semibold text-brand-strong ring-1 ring-brand/25 ring-inset",
        shape,
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
