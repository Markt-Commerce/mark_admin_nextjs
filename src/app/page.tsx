import { redirect } from "next/navigation";

/** No dashboard: staff land on the seller verification queue (Phase 0 #4). */
export default function Home() {
  redirect("/sellers?verification_status=pending");
}
