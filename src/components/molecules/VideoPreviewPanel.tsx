"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { ThumbnailVariantsPanel } from "@/components/organisms/ThumbnailVariantsPanel";
import type { ThumbnailVariant, SourceType, HookTone, InlineAlert } from "@/lib/types/thumbnails";

export interface VideoPreviewPanelProps {
  sourceType: SourceType;
  hookText: string;
  tone: HookTone;
  variants: ThumbnailVariant[];
  selectedVariantId: string | null;
  onVariantsChange: (variants: ThumbnailVariant[]) => void;
  onSelectedVariantChange: (variantId: string | null) => void;
  onInlineAlert: (alert: InlineAlert | null) => void;
  hasVideoUploaded?: boolean;
  hasImagesUploaded?: boolean;
  assetIds?: string[];
}

export const VideoPreviewPanel = ({
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
}: VideoPreviewPanelProps) => {
  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] h-full flex flex-col">
      <CardHeader>
        <CardTitle id="preview-heading">Thumbnail Variants</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ThumbnailVariantsPanel
          sourceType={sourceType}
          hookText={hookText}
          tone={tone}
          variants={variants}
          selectedVariantId={selectedVariantId}
          onVariantsChange={onVariantsChange}
          onSelectedVariantChange={onSelectedVariantChange}
          onInlineAlert={onInlineAlert}
          hasVideoUploaded={hasVideoUploaded}
          hasImagesUploaded={hasImagesUploaded}
          assetIds={assetIds}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
};
