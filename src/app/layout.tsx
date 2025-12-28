import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Meta Generate",
  description: "Frontend and API for generating video metadata."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-hero-start)_0%,_var(--color-hero-mid)_45%,_var(--color-hero-end)_100%)] px-6 py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
