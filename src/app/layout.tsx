import type { Metadata } from "next";
import { Livvic } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

// Brand typeface, from markt_angular src/styles.css.
const livvic = Livvic({
  variable: "--font-livvic",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Markt Admin",
    template: "%s · Markt Admin",
  },
  description: "Staff console for Markt",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${livvic.variable} h-full`}>
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
