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
    <header className="sticky top-4 z-20 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Video Meta Generate
          </p>
          <p className="text-xs text-slate-500">
            Metadata intelligence for modern video teams.
          </p>
        </div>
        <nav className="hidden items-center gap-4 text-sm text-slate-300 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className="transition hover:text-white"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            href="#final-cta"
          >
            Book a demo
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-800 p-2 text-slate-200 transition hover:border-slate-600 md:hidden"
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
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-800/70 pt-4 text-sm text-slate-300 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className="transition hover:text-white"
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
