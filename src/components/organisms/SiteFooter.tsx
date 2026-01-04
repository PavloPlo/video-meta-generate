import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Video Meta Generate
        </p>
        <div className="flex flex-wrap gap-4">
          <Link className="transition hover:text-slate-900" href="/privacy">
            Privacy
          </Link>
          <Link className="transition hover:text-slate-900" href="/terms">
            Terms
          </Link>
          <Link
            className="transition hover:text-slate-900"
            href="mailto:contact@videometagenerate.com"
          >
            Contact
          </Link>
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Built for teams publishing video content across global markets.
      </p>
    </footer>
  );
}
