"use client";

import { useId, useState } from "react";

const faqItems = [
  {
    question: "How does Video Meta Generate build metadata for our videos?",
    answer:
      "We analyze transcripts, scene changes, and engagement signals to draft titles, descriptions, chapters, and tags tailored to each platform."
  },
  {
    question: "Can we customize the tone and style of generated copy?",
    answer:
      "Yes. You can set brand voice guidelines, preferred terminology, and formatting rules so outputs stay on-brand."
  },
  {
    question: "What input files do you need to get started?",
    answer:
      "Upload the final video file or provide a streaming link, plus any existing scripts or notes to enrich the metadata." 
  },
  {
    question: "How long does it take to generate metadata?",
    answer:
      "Most videos are processed in minutes. Longer content can take a bit more time depending on length and analysis depth." 
  },
  {
    question: "Does the platform support multiple languages?",
    answer:
      "We support multilingual metadata generation and can localize outputs for global audiences." 
  },
  {
    question: "How do we review and approve outputs?",
    answer:
      "Your team gets a review dashboard with side-by-side comparisons and inline editing before publishing." 
  },
  {
    question: "Is there an API for automating metadata workflows?",
    answer:
      "Yes. Our API lets you submit videos, retrieve metadata, and sync updates directly with your CMS." 
  },
  {
    question: "What does onboarding look like?",
    answer:
      "We start with a discovery session, configure your brand settings, and run a pilot batch before scaling." 
  }
];

export default function FAQAccordion() {
  const accordionId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
          FAQ
        </p>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
          Answers to common questions
        </h2>
        <p className="text-sm text-slate-400">
          Everything you need to know about how we generate metadata at scale.
        </p>
      </div>
      <div className="mt-6 divide-y divide-slate-800">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `${accordionId}-panel-${index}`;
          const buttonId = `${accordionId}-button-${index}`;

          return (
            <div key={item.question} className="py-4">
              <button
                id={buttonId}
                className="flex w-full items-center justify-between gap-4 text-left text-base font-semibold text-slate-100 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                onClick={() =>
                  setOpenIndex((current) => (current === index ? null : index))
                }
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.question}</span>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-200"
                  aria-hidden="true"
                >
                  <svg
                    className={`h-4 w-4 transition ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                aria-hidden={!isOpen}
                className={`overflow-hidden text-sm text-slate-300 transition-all duration-200 ${
                  isOpen ? "max-h-64 pt-3" : "max-h-0"
                }`}
              >
                <p className="pr-10">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
