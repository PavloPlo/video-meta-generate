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
      <body className="bg-[#f6f7fb] text-slate-950 antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef2ff_0%,_#f6f7fb_45%,_#f8fafc_100%)] px-6 py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
