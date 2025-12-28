import Link from "next/link";

import HeaderSticky from "@/components/landing/HeaderSticky";

const proofStats = [
  { label: "Creator teams onboarded", value: "220+" },
  { label: "Avg. metadata time saved", value: "62%" },
  { label: "Languages supported", value: "40" }
];

const problemPoints = [
  "Creators spend hours crafting titles and descriptions across platforms.",
  "Metadata quality varies by channel, hurting search and discovery.",
  "Localization efforts lag behind release schedules."
];

const solutionPillars = [
  {
    title: "Unified metadata workspace",
    description:
      "Centralize titles, descriptions, tags, and chapters in one workflow.",
    bullets: [
      "One source of truth for every video",
      "Team approvals with change history",
      "Instant export to publishing tools"
    ]
  },
  {
    title: "AI-assisted optimization",
    description:
      "Generate, score, and iterate on metadata variants with confidence.",
    bullets: [
      "Realtime SEO and engagement scoring",
      "Tone controls per channel",
      "Guardrails for brand-safe copy"
    ]
  }
];

const featureCards = [
  {
    title: "Metadata briefs",
    description: "Capture positioning, keywords, and target audiences in seconds."
  },
  {
    title: "Variant studio",
    description: "Spin up multiple title/description options per platform."
  },
  {
    title: "Approval flows",
    description: "Route drafts through editors and compliance teams."
  },
  {
    title: "Performance lift",
    description: "Compare publish-ready variants against historical benchmarks."
  },
  {
    title: "Smart tagging",
    description: "Suggest tags that align with channel intent and trends."
  }
];

const steps = [
  {
    title: "Upload your video brief",
    description: "Provide format, channel goals, and target topics."
  },
  {
    title: "Generate and refine",
    description: "Review AI-generated metadata and adjust tone or length."
  },
  {
    title: "Publish everywhere",
    description: "Export finalized metadata to YouTube, TikTok, and CMS tools."
  }
];

const examples = [
  {
    title: "Creator launch kit",
    description: "Taglines, hooks, and chapter timestamps ready in 4 minutes."
  },
  {
    title: "Product tutorial set",
    description: "Consistent metadata across a 12-part onboarding series."
  },
  {
    title: "Live event recap",
    description: "Highlight clips packaged for search in multiple languages."
  },
  {
    title: "Podcast cutdowns",
    description: "Short-form titles optimized for discovery and retention."
  }
];

const faqItems = [
  {
    question: "Which platforms are supported today?",
    answer:
      "We cover YouTube, TikTok, Instagram Reels, Vimeo, and custom CMS exports."
  },
  {
    question: "How do approvals work?",
    answer:
      "Invite editors or stakeholders to approve drafts with comments and version history."
  },
  {
    question: "Can we customize tone and brand voice?",
    answer:
      "Yes—set voice profiles, banned phrases, and required keywords for each channel."
  },
  {
    question: "Does it support multiple languages?",
    answer:
      "Generate localized metadata in 40 languages with built-in quality checks."
  },
  {
    question: "Is there an API?",
    answer:
      "The API lets you trigger generation, manage briefs, and pull analytics."
  },
  {
    question: "How quickly can we onboard?",
    answer:
      "Most teams launch within a week using our templates and guided setup."
  }
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <HeaderSticky />

      <section id="hero" className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Intelligent video metadata
          </p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">
            Publish video metadata faster, smarter, and in every language.
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            Video Meta Generate helps creator teams turn briefs into optimized
            titles, descriptions, chapters, and tags with AI-assisted workflows
            and brand-safe controls.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950"
              href="#pricing"
            >
              See pricing
            </Link>
            <Link
              className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white"
              href="#examples"
            >
              View examples
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <span>Trusted by creator studios</span>
            <span>Security-ready workflows</span>
            <span>Fast onboarding</span>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-500/10 p-6">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Draft metadata preview
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                5 tips to grow your creator economy channel
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Generated description, chapters, and tags tailored to YouTube.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                >
                  <p className="text-2xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="proof"
        className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:grid-cols-3"
      >
        {proofStats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2">
            <p className="text-3xl font-semibold text-white">{stat.value}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section id="problem" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            The problem
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Metadata is the bottleneck for scaling video performance.
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Without a dedicated workflow, teams juggle spreadsheets, version
            chaos, and inconsistent copy. That slows launches and leaves
            discoverability on the table.
          </p>
        </div>
        <ul className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          {problemPoints.map((point) => (
            <li key={point} className="flex gap-3 border-b border-slate-800/60 py-3 last:border-b-0">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="solution" className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            The solution
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Two pillars for repeatable metadata excellence.
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {solutionPillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <h3 className="text-xl font-semibold text-white">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {pillar.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {pillar.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Feature grid
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Everything needed to craft publish-ready metadata.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <h3 className="text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            How it works
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Three steps to metadata that performs.
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div>
            <p className="text-sm font-semibold text-white">
              Ready to streamline metadata?
            </p>
            <p className="text-xs text-slate-400">
              Launch a pilot in under 7 days.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950"
              href="#pricing"
            >
              Start a pilot
            </Link>
            <Link
              className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white"
              href="#final-cta"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <section id="examples" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Examples gallery
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Metadata packages built for real creator teams.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {examples.map((example) => (
            <div
              key={example.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <h3 className="text-lg font-semibold text-white">
                {example.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {example.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="trends" className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Trends + multilingual
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Keep pace with trends, in every language you publish.
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Surface trending topics, hook formats, and hashtag clusters, then
            localize instantly for global audiences without sacrificing tone.
          </p>
        </div>
        <ul className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
          <li className="flex gap-3 border-b border-slate-800/60 py-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            <span>Auto-detected trend alerts for your content category.</span>
          </li>
          <li className="flex gap-3 border-b border-slate-800/60 py-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            <span>Multilingual rewrites with tone and keyword fidelity.</span>
          </li>
          <li className="flex gap-3 py-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            <span>Regional performance insights to guide optimization.</span>
          </li>
        </ul>
      </section>

      <section
        id="pricing"
        className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Pricing teaser
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Flexible plans for creator teams and enterprises.
          </h2>
          <p className="text-sm text-slate-300">
            Start with a pilot, then scale to high-volume metadata production
            with advanced governance.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>Unlimited metadata variants per video.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>Team roles, approvals, and audit trails.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>Dedicated success manager for launch.</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              Team pilot
            </p>
            <p className="mt-2 text-4xl font-semibold text-white">
              $1,200<span className="text-base font-normal">/month</span>
            </p>
            <p className="mt-2 text-sm text-slate-200">
              Ideal for 5-15 creators with weekly publishing cadence.
            </p>
          </div>
          <Link
            className="rounded-full bg-emerald-400 px-5 py-2 text-center text-sm font-semibold text-slate-950"
            href="#final-cta"
          >
            Request pricing details
          </Link>
        </div>
      </section>

      <section id="faq" className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            FAQ
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Questions teams ask before switching metadata workflows.
          </h2>
        </div>
        <div className="grid gap-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <summary className="cursor-pointer text-sm font-semibold text-white">
                {item.question}
              </summary>
              <p className="mt-3 text-sm text-slate-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        id="final-cta"
        className="rounded-3xl border border-emerald-400/40 bg-emerald-500/10 p-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
              Final CTA
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Bring clarity and speed to your metadata pipeline.
            </h2>
            <p className="mt-2 text-sm text-slate-200">
              Schedule a guided walkthrough tailored to your team.
            </p>
          </div>
          <Link
            className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950"
            href="mailto:hello@videometagenerate.com"
          >
            Schedule a walkthrough
          </Link>
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-400">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Video Meta Generate
          </p>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-white" href="/terms">
              Terms
            </Link>
            <Link
              className="hover:text-white"
              href="mailto:contact@videometagenerate.com"
            >
              Contact
            </Link>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Built for teams publishing video content across global markets.
        </p>
      </footer>
    </main>
  );
}
