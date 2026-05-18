import type { Metadata } from "next";

import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuestOps Chaos Lab",
  description: "An eval cockpit for multi-channel hospitality AI concierge agents.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
