import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncDocs",
  description: "A modern, Notion-inspired documentation platform for teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
