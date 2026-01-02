"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { ThumbnailVariantCard } from "@/components/atoms/ThumbnailVariantCard";
import { ThumbnailVariantSkeleton } from "@/components/atoms/ThumbnailVariantSkeleton";
import { ThumbnailVariantPlaceholder } from "@/components/atoms/ThumbnailVariantPlaceholder";
import { InlineAlert } from "@/components/atoms/InlineAlert";
import { generateThumbnails, regenerateThumbnails } from "@/lib/thumbnails";
import {
  VALIDATION_RULES,
  THUMBNAIL_SOURCE_TYPES,
  ALERT_SCOPES,
  ALERT_KINDS
} from "@/constants/video";
import type {
  ThumbnailVariant,
  SourceType,
  HookTone,
  InlineAlert as InlineAlertType
} from "@/lib/types/thumbnails";

export interface ThumbnailVariantsPanelProps {
  sourceType: SourceType;
  hookText: string;
  tone: HookTone;
  variants: ThumbnailVariant[];
  selectedVariantId: string | null;
  onVariantsChange: (variants: ThumbnailVariant[]) => void;
  onSelectedVariantChange: (variantId: string | null) => void;
  regenerationCount: number;
  onRegenerationCountChange: (count: number | ((prev: number) => number)) => void;
  onInlineAlert: (alert: InlineAlertType | null) => void;
  hasVideoUploaded?: boolean;
  hasImagesUploaded?: boolean;
  assetIds?: string[];
  className?: string;
}

export const ThumbnailVariantsPanel = ({
  sourceType,
  hookText,
  tone,
  variants,
  selectedVariantId,
  onVariantsChange,
  onSelectedVariantChange,
  regenerationCount,
  onRegenerationCountChange,
  onInlineAlert,
  hasVideoUploaded = false,
  hasImagesUploaded = false,
  assetIds = [],
  className,
}: ThumbnailVariantsPanelProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const canGenerate = (() => {
    if (!hookText.trim()) return false;
    if (sourceType === THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES && !hasVideoUploaded) return false;
    if (sourceType === THUMBNAIL_SOURCE_TYPES.IMAGES && (!hasImagesUploaded || assetIds.length === 0)) return false;
    return true;
  })();

  const canRegenerate = variants.length > 0 && regenerationCount < 6;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    onInlineAlert({
      scope: ALERT_SCOPES.GENERATE,
      kind: ALERT_KINDS.INFO,
      message: "Generating thumbnails, description, and tags...",
    });

    try {
      const response = await generateThumbnails({
        hookText: hookText.trim(),
        tone,
        source: {
          type: sourceType,
          assetIds,
        },
        count: VALIDATION_RULES.THUMBNAIL_VARIANTS_INITIAL,
      });

      const newVariants = response.variants.slice(0, VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX);
      onVariantsChange(newVariants);

      // Auto-select first variant if none selected
      if (!selectedVariantId && newVariants.length > 0) {
        onSelectedVariantChange(newVariants[0].id);
      }

      onInlineAlert({
        scope: ALERT_SCOPES.GENERATE,
        kind: ALERT_KINDS.SUCCESS,
        message: "All metadata generated successfully!",
      });
    } catch (error) {
      onInlineAlert({
        scope: ALERT_SCOPES.GENERATE,
        kind: ALERT_KINDS.ERROR,
        message: error instanceof Error ? error.message : "Failed to generate thumbnails",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!canRegenerate) {
      onInlineAlert({
        scope: ALERT_SCOPES.REGENERATE,
        kind: ALERT_KINDS.WARNING,
        message: "You've reached the limit. Choose a thumbnail to continue.",
      });
      return;
    }

    if (!canGenerate) return;

    const remainingSlots = VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX - variants.length;
    const count = Math.min(VALIDATION_RULES.THUMBNAIL_VARIANTS_REGENERATE, remainingSlots);

    setIsRegenerating(true);
    onInlineAlert({
      scope: ALERT_SCOPES.REGENERATE,
      kind: ALERT_KINDS.INFO,
      message: `Generating ${count} more thumbnails...`,
    });

    try {
      const response = await regenerateThumbnails({
        hookText: hookText.trim(),
        tone,
        source: {
          type: sourceType,
          assetIds,
        },
        count,
      });

      const newVariants = [...variants, ...response.variants].slice(0, VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX);
      onVariantsChange(newVariants);

      // Increment regeneration count
      onRegenerationCountChange(regenerationCount + 1);

      onInlineAlert({
        scope: ALERT_SCOPES.REGENERATE,
        kind: ALERT_KINDS.SUCCESS,
        message: `Generated ${Math.min(count, response.variants.length)} more thumbnails`,
      });
    } catch (error) {
      onInlineAlert({
        scope: ALERT_SCOPES.REGENERATE,
        kind: ALERT_KINDS.ERROR,
        message: error instanceof Error ? error.message : "Failed to regenerate thumbnails",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleVariantSelect = (variantId: string) => {
    onSelectedVariantChange(variantId);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Controls - Primary CTA Hierarchy */}
      <div className="space-y-3 mb-6">
        {/* Primary: Generate */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
        >
          {isGenerating ? "Generating all metadata..." : "Generate all metadata"}
        </Button>

        {/* Secondary: Regenerate - visually de-emphasized until variants exist */}
        {variants.length > 0 && (
          <Button
            onClick={handleRegenerate}
            disabled={!canRegenerate || isRegenerating || !canGenerate}
            variant="outline"
            className="w-full opacity-75 hover:opacity-100 transition-opacity"
          >
            {isRegenerating ? "Generating more thumbnails..." : "Generate more thumbnails"}
          </Button>
        )}
      </div>

      {/* Variants Grid - takes remaining height */}
      <div className="flex-1 min-h-0">
        {/* Loading State */}
        {(isGenerating || isRegenerating) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {Array.from({ length: VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX }).map((_, i) => (
              <ThumbnailVariantSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {variants.length === 0 && !isGenerating && !isRegenerating && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 bg-slate-50">
              <div className="text-slate-500 mb-4">
                <p className="text-lg font-medium mb-2">Your thumbnail options will appear here</p>
              </div>
              <Button
                disabled={!canGenerate}
                variant="outline"
                className="pointer-events-none opacity-50"
              >
                Generate all metadata
              </Button>
            </div>
          </div>
        )}

        {/* Variants Grid - Always show 6 slots */}
        {variants.length > 0 && !isGenerating && !isRegenerating && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {/* Render actual variants */}
              {variants.map((variant) => (
                <ThumbnailVariantCard
                  key={variant.id}
                  variant={variant}
                  isSelected={selectedVariantId === variant.id}
                  onSelect={() => handleVariantSelect(variant.id)}
                />
              ))}

              {/* Render placeholders for remaining slots */}
              {Array.from({ length: VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX - variants.length }).map((_, i) => (
                <ThumbnailVariantPlaceholder key={`placeholder-${i}`} />
              ))}
            </div>

            {/* Limit Reached Message */}
            {regenerationCount >= 6 && (
              <InlineAlert
                scope={ALERT_SCOPES.REGENERATE}
                kind={ALERT_KINDS.WARNING}
                message="You've reached the limit. Choose a thumbnail to continue."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
