export const VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
  TAGS_MAX_COUNT: 15,
  THUMBNAIL_VARIANTS_MAX: 6,
  THUMBNAIL_VARIANTS_INITIAL: 3,
  THUMBNAIL_VARIANTS_REGENERATE: 3,
  HOOK_TEXT_MAX_LENGTH: 200,
} as const;

export const VIDEO_METADATA_TYPES = {
  TITLE: 'title',
  DESCRIPTION: 'description',
  TAGS: 'tags',
  THUMBNAIL: 'thumbnail',
  CHAPTERS: 'chapters',
} as const;

export const THUMBNAIL_SOURCE_TYPES = {
  VIDEO_FRAMES: 'videoFrames',
  IMAGES: 'images',
} as const;

export const HOOK_TONES = {
  VIRAL: 'viral',
  CURIOSITY: 'curiosity',
  EDUCATIONAL: 'educational',
} as const;

export const READABILITY_LEVELS = {
  GOOD: 'good',
  OK: 'ok',
  POOR: 'poor',
  UNKNOWN: 'unknown',
} as const;

export const ALERT_KINDS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const ALERT_SCOPES = {
  SOURCE: 'source',
  CONTROLS: 'controls',
  GENERATE: 'generate',
  REGENERATE: 'regenerate',
} as const;
