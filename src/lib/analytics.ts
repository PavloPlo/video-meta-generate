type AnalyticsProps = Record<string, unknown>;

declare global {
  interface Window {
    analytics?: {
      track?: (event: string, props?: AnalyticsProps) => void;
    };
  }
}

const hasConsent = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return true;
};

export const track = (event: string, props: AnalyticsProps = {}) => {
  if (!hasConsent() || typeof window === "undefined") {
    return;
  }

  if (window.analytics?.track) {
    window.analytics.track(event, props);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, props);
  }
};
