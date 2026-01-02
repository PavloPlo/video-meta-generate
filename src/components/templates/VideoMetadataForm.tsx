"use client";

import { useState } from "react";
import { VideoInputPanel } from "@/components/molecules/VideoInputPanel";
import { VideoPreviewPanel } from "@/components/molecules/VideoPreviewPanel";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES } from "@/constants/video";
import type { ThumbnailVariant, SourceType, HookTone, InlineAlert } from "@/lib/types/thumbnails";

export const VideoMetadataForm = () => {
  // Thumbnail variants state
  const [sourceType, setSourceType] = useState<SourceType>(THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES);
  const [hookText, setHookText] = useState("");
  const [tone, setTone] = useState<HookTone>(HOOK_TONES.VIRAL);
  const [variants, setVariants] = useState<ThumbnailVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [inlineAlert, setInlineAlert] = useState<InlineAlert | null>(null);

  // Asset upload state (mocked for now - would be connected to actual upload system)
  const [hasVideoUploaded, setHasVideoUploaded] = useState(false);
  const [hasImagesUploaded, setHasImagesUploaded] = useState(false);
  const [assetIds, setAssetIds] = useState<string[]>([]);

  const handleSourceTypeChange = (newSourceType: SourceType) => {
    setSourceType(newSourceType);
  };

  const handleHookTextChange = (newHookText: string) => {
    setHookText(newHookText);
  };

  const handleToneChange = (newTone: HookTone) => {
    setTone(newTone);
  };

  const handleVariantsChange = (newVariants: ThumbnailVariant[]) => {
    setVariants(newVariants);
  };

  const handleSelectedVariantChange = (variantId: string | null) => {
    setSelectedVariantId(variantId);
  };

  const handleInlineAlert = (alert: InlineAlert | null) => {
    setInlineAlert(alert);
  };

  // Mock functions for asset upload (would be connected to actual upload system)
  const handleVideoUpload = () => {
    setHasVideoUploaded(true);
    setAssetIds(['video-1']); // Mock asset ID
  };

  const handleImagesUpload = () => {
    setHasImagesUploaded(true);
    setAssetIds(['image-1', 'image-2']); // Mock asset IDs
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <VideoInputPanel
        onSourceTypeChange={handleSourceTypeChange}
        onHookTextChange={handleHookTextChange}
        onToneChange={handleToneChange}
        onInlineAlert={handleInlineAlert}
        hasVideoUploaded={hasVideoUploaded}
        hasImagesUploaded={hasImagesUploaded}
      />

      <VideoPreviewPanel
        sourceType={sourceType}
        hookText={hookText}
        tone={tone}
        variants={variants}
        selectedVariantId={selectedVariantId}
        onVariantsChange={handleVariantsChange}
        onSelectedVariantChange={handleSelectedVariantChange}
        onInlineAlert={handleInlineAlert}
        hasVideoUploaded={hasVideoUploaded}
        hasImagesUploaded={hasImagesUploaded}
        assetIds={assetIds}
      />

      {/* Development helpers - remove in production */}
      <div className="lg:col-span-2 mt-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-medium text-slate-700 mb-2">Development Controls</h3>
        <div className="flex gap-4">
          <button
            onClick={handleVideoUpload}
            className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Mock Video Upload
          </button>
          <button
            onClick={handleImagesUpload}
            className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            Mock Images Upload
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Source: {sourceType} | Hook: &ldquo;{hookText}&rdquo; | Tone: {tone} | Variants: {variants.length} | Selected: {selectedVariantId || 'none'}
        </div>
      </div>
    </div>
  );
};
