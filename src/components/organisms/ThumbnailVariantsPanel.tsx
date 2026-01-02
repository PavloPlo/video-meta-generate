"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { ThumbnailVariantCard } from "@/components/atoms/ThumbnailVariantCard";
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

  const canRegenerate = variants.length > 0 && variants.length < VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    onInlineAlert({
      scope: ALERT_SCOPES.GENERATE,
      kind: ALERT_KINDS.INFO,
      message: `Generating ${VALIDATION_RULES.THUMBNAIL_VARIANTS_INITIAL} thumbnails...`,
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
        message: "Thumbnail options ready",
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
        message: "Limit reached—please choose a thumbnail",
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
      message: `Adding ${count} new thumbnails...`,
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

      onInlineAlert({
        scope: ALERT_SCOPES.REGENERATE,
        kind: ALERT_KINDS.SUCCESS,
        message: `Added ${Math.min(count, response.variants.length)} new variants`,
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
    <div className={className}>
      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          className="flex-1"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>

        <Button
          onClick={handleRegenerate}
          disabled={!canRegenerate || isRegenerating || !canGenerate}
          variant="outline"
          className="flex-1"
        >
          {isRegenerating ? "Adding..." : "Regenerate"}
        </Button>
      </div>

      {/* Variants Grid */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {variants.map((variant) => (
              <ThumbnailVariantCard
                key={variant.id}
                variant={variant}
                isSelected={selectedVariantId === variant.id}
                onSelect={() => handleVariantSelect(variant.id)}
              />
            ))}
          </div>

          {/* Limit Reached Message */}
          {variants.length >= VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX && (
            <InlineAlert
              scope={ALERT_SCOPES.REGENERATE}
              kind={ALERT_KINDS.WARNING}
              message="Maximum of 6 thumbnails reached. Choose one to continue."
            />
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {(isGenerating || isRegenerating) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: isGenerating ? VALIDATION_RULES.THUMBNAIL_VARIANTS_INITIAL : VALIDATION_RULES.THUMBNAIL_VARIANTS_REGENERATE }).map((_, i) => (
            <div key={i} className="aspect-video rounded-lg bg-slate-200 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
};
