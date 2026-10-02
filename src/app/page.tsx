import { redirect } from "next/navigation";

/**
 * No dashboard: staff land on the seller verification queue, which
 * defaults to sellers pending review (Phase 0 decision #4).
 */
export default function Home() {
  redirect("/sellers");
}
