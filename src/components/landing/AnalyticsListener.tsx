"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";

const scrollDepthThresholds = [25, 50, 75, 90];

const getScrollDepth = () => {
  const { scrollHeight, scrollTop, clientHeight } =
    document.documentElement;
  const totalScrollable = scrollHeight - clientHeight;

  if (totalScrollable <= 0) {
    return 100;
  }

  return Math.round((scrollTop / totalScrollable) * 100);
};

export default function AnalyticsListener() {
  useEffect(() => {
    const seenDepths = new Set<number>();

    const handleScroll = () => {
      const depth = getScrollDepth();

      scrollDepthThresholds.forEach((threshold) => {
        if (depth >= threshold && !seenDepths.has(threshold)) {
          seenDepths.add(threshold);
          track("scroll_depth", { percent: threshold });
        }
      });
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const ctaTarget = target.closest<HTMLElement>("[data-cta]");
      if (ctaTarget) {
        track("cta_click", { cta: ctaTarget.dataset.cta ?? "" });
        return;
      }

      const exampleTarget = target.closest<HTMLElement>("[data-example]");
      if (exampleTarget) {
        track("example_view", { example: exampleTarget.dataset.example ?? "" });
      }
    };

    const handleFaqToggle = (event: Event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement)) {
        return;
      }

      if (details.open) {
        track("faq_expand", { question: details.dataset.faq ?? "" });
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClick);
    document.addEventListener("toggle", handleFaqToggle, true);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("toggle", handleFaqToggle, true);
    };
  }, []);

  return null;
}
