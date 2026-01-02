// UI text constants for button labels, messages, and user-facing strings
export const BUTTON_LABELS = {
  GENERATE_METADATA: "Generate metadata",
  ADD_MORE_VARIANTS: "Add more variants",
  GENERATING_METADATA: "Generating metadata...",
  GENERATING_MORE_THUMBNAILS: "Generating more thumbnails...",
  GENERATING_MORE_VARIANTS: "Adding more variants...",
  // Mobile-specific buttons
  GENERATE_METADATA_DISABLED: "Complete inputs to generate",
  REGENERATE: "Regenerate",
  EDIT_INPUTS: "Edit Inputs",
} as const;

// Mobile tab labels
export const MOBILE_TABS = {
  INPUTS: "Inputs",
  RESULTS: "Results",
} as const;

// Mobile validation messages
export const MOBILE_VALIDATION = {
  HOOK_TEXT_TOO_LONG: "Hook text must be 200 characters or less",
  MISSING_VIDEO: "Please upload a video or select images",
  MISSING_IMAGES: "Please upload images or select video",
  TONE_REQUIRED: "Please select a tone",
} as const;

export const ALERT_MESSAGES = {
  GENERATING_THUMBNAILS: "Images sent for processing",
  GENERATING_MORE_THUMBNAILS: "Generating more thumbnails...",
  ALL_METADATA_GENERATED: "All metadata generated successfully!",
  VARIANTS_ADDED: (count: number) => `${count} new options added`,
  MORE_THUMBNAILS_GENERATED: (count: number) =>
    `Generated ${count} more thumbnails`,
  REGENERATION_LIMIT_REACHED:
    "You've reached the limit. Choose a thumbnail to continue.",
  GENERATION_FAILED: "Failed to generate thumbnails",
  REGENERATION_FAILED: "Failed to regenerate thumbnails",
  // Mobile-specific messages
  METADATA_GENERATED_SUCCESS: "Metadata generated successfully!",
  METADATA_GENERATION_FAILED: "Failed to generate metadata",
} as const;
