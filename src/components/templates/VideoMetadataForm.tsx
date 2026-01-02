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
    <div className="grid gap-6 lg:grid-cols-2 min-h-[600px]">
      <div className="min-h-[600px]">
        <VideoInputPanel
          onSourceTypeChange={handleSourceTypeChange}
          onHookTextChange={handleHookTextChange}
          onToneChange={handleToneChange}
          onFileUpload={(type) => {
            if (type === 'video') {
              handleVideoUpload();
            } else if (type === 'images') {
              handleImagesUpload();
            }
          }}
          hasVideoUploaded={hasVideoUploaded}
          hasImagesUploaded={hasImagesUploaded}
        />
      </div>

      <div className="min-h-[600px]">
        <VideoPreviewPanel
          sourceType={sourceType}
          hookText={hookText}
          tone={tone}
          variants={variants}
          selectedVariantId={selectedVariantId}
          onVariantsChange={handleVariantsChange}
          onSelectedVariantChange={handleSelectedVariantChange}
          hasVideoUploaded={hasVideoUploaded}
          hasImagesUploaded={hasImagesUploaded}
          assetIds={assetIds}
        />
      </div>

      {/* Development helpers - remove in production */}
      <div className="lg:col-span-2 mt-8 p-4 bg-slate-50 rounded-lg">
        <div className="text-xs text-slate-500">
          Source: {sourceType} | Hook: &ldquo;{hookText}&rdquo; | Tone: {tone} | Variants: {variants.length} | Selected: {selectedVariantId || 'none'}
        </div>
      </div>
    </div>
  );
};
