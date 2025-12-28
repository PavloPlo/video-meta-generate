"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Proof", href: "#proof" },
  { label: "Features", href: "#features" },
  { label: "Examples", href: "#examples" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

export default function HeaderSticky() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-20 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Video Meta Generate
          </p>
          <p className="text-xs text-slate-400">
            Metadata intelligence for modern video teams.
          </p>
        </div>
        <nav className="hidden items-center gap-4 text-sm text-slate-600 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className="transition hover:text-slate-950"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(79,70,229,0.8)] transition hover:from-indigo-500 hover:to-sky-400"
            href="#final-cta"
            data-cta="header_book_demo"
          >
            Book a demo
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-slate-300 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            type="button"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200/70 pt-4 text-sm text-slate-600 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className="transition hover:text-slate-950"
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
