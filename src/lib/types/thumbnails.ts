import type {
  HOOK_TONES,
  READABILITY_LEVELS,
  ALERT_KINDS,
  ALERT_SCOPES,
  THUMBNAIL_SOURCE_TYPES,
} from "@/constants/video";

export type HookTone = (typeof HOOK_TONES)[keyof typeof HOOK_TONES];
export type Readability =
  (typeof READABILITY_LEVELS)[keyof typeof READABILITY_LEVELS];
export type AlertKind = (typeof ALERT_KINDS)[keyof typeof ALERT_KINDS];
export type AlertScope = (typeof ALERT_SCOPES)[keyof typeof ALERT_SCOPES];
export type SourceType =
  (typeof THUMBNAIL_SOURCE_TYPES)[keyof typeof THUMBNAIL_SOURCE_TYPES];

export interface ThumbnailVariant {
  id: string;
  imageUrl: string;
  readability?: Exclude<Readability, "unknown">;
}

export interface InlineAlert {
  scope: AlertScope;
  kind: AlertKind;
  message: string;
  isVisible?: boolean;
}

export interface GenerateThumbnailsRequest {
  hookText: string;
  tone: HookTone;
  source: {
    type: SourceType;
    assetIds: string[];
  };
  count: number;
}

export interface GenerateThumbnailsResponse {
  variants: ThumbnailVariant[];
}

export interface ThumbnailError {
  code: "VALIDATION_ERROR" | "RATE_LIMITED" | "SERVER_ERROR";
  message: string;
}

export interface ThumbnailApiResponse {
  variants?: ThumbnailVariant[];
  error?: ThumbnailError;
}
