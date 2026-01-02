export const VALIDATION_RULES = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
  TAGS_MAX_COUNT: 15,
  THUMBNAIL_VARIANTS_MAX: 6,
  THUMBNAIL_VARIANTS_INITIAL: 3,
  THUMBNAIL_VARIANTS_REGENERATE: 3,
  HOOK_TEXT_MAX_LENGTH: 200,
  HOOK_TEXT_RECOMMENDED_LENGTH: 70,
} as const;

export const UPLOAD_CONSTRAINTS = {
  VIDEO_MAX_SIZE_MB: 500,
  VIDEO_MAX_DURATION_SECONDS: 7200, // 2 hours
  IMAGE_MAX_SIZE_MB: 10,
  IMAGE_MAX_COUNT: 10,
} as const;

export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
] as const;

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const UPLOAD_ERROR_MESSAGES = {
  FILE_TOO_LARGE: (maxSize: number, type: 'video' | 'image') =>
    `${type === 'video' ? 'Video' : 'Image'} file size must be under ${maxSize}MB`,
  VIDEO_TOO_LONG: (maxDuration: number) =>
    `Video duration must be under ${Math.floor(maxDuration / 60)} minutes`,
  UNSUPPORTED_FORMAT: (type: 'video' | 'image') =>
    `Unsupported ${type} format. Please use a supported format.`,
  VIDEO_LOAD_ERROR: 'Unable to load video file. Please try a different file.',
  GENERIC_ERROR: 'An error occurred while processing the file.',
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

export const TONE_OPTIONS = [
  {
    value: 'viral',
    label: 'Viral',
    description: 'Attention-grabbing and shareable',
    icon: '🔥',
    color: 'text-red-600',
  },
  {
    value: 'curiosity',
    label: 'Curiosity',
    description: 'Spark interest and questions',
    icon: '❓',
    color: 'text-blue-600',
  },
  {
    value: 'educational',
    label: 'Educational',
    description: 'Informative and helpful',
    icon: '🎓',
    color: 'text-green-600',
  },
] as const;