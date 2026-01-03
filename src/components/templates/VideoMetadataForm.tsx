"use client";

import { useState } from "react";
import { VideoInputPanel, type GenerationOptions } from "@/components/molecules/VideoInputPanel";
import { VideoPreviewPanel } from "@/components/molecules/VideoPreviewPanel";
import { generateThumbnails } from "@/lib/thumbnails";
import { generateDescription as generateDescriptionApi, generateTags as generateTagsApi } from "@/lib/metadata";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES, VALIDATION_RULES } from "@/constants/video";
import { ALERT_MESSAGES } from "@/constants/ui";
import type { ThumbnailVariant, SourceType, HookTone, SectionStatus } from "@/lib/types/thumbnails";

export const VideoMetadataForm = () => {
  // Thumbnail variants state
  const [sourceType, setSourceType] = useState<SourceType>(THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES);
  const [hookText, setHookText] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [tone, setTone] = useState<HookTone>(HOOK_TONES.VIRAL);
  const [variants, setVariants] = useState<ThumbnailVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState<string>('');
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    thumbnails: true,
    description: true,
    tags: true,
  });

  // Per-section status tracking
  const [thumbnailsStatus, setThumbnailsStatus] = useState<SectionStatus>("idle");
  const [descriptionStatus, setDescriptionStatus] = useState<SectionStatus>("idle");
  const [tagsStatus, setTagsStatus] = useState<SectionStatus>("idle");
  const [thumbnailsError, setThumbnailsError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);

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

  const handleVideoDescriptionChange = (newVideoDescription: string) => {
    setVideoDescription(newVideoDescription);
  };

  const handleToneChange = (newTone: HookTone) => {
    setTone(newTone);
  };

  const handleVariantsChange = (newVariants: ThumbnailVariant[]) => {
    setVariants(newVariants);
  };

  const generateDescription = async (): Promise<{ success: boolean; description?: string }> => {
    setDescriptionStatus("loading");
    setDescriptionError(null);

    try {
      // Call the description API
      // TODO: The API returns hardcoded responses when USE_AI_GENERATION=false
      // Set USE_AI_GENERATION=true in src/app/api/metadata/description/route.ts for real AI
      const response = await generateDescriptionApi({
        hookText: hookText.trim(),
        tone,
        // Pass videoDescription as additional context when hookText is empty
        videoDescription: videoDescription.trim() || undefined,
      });

      setDescription(response.description);
      setDescriptionStatus("success");
      return { success: true, description: response.description };
    } catch (error) {
      setDescriptionError(error instanceof Error ? error.message : ALERT_MESSAGES.DESCRIPTION_GENERATION_FAILED);
      setDescriptionStatus("error");
      return { success: false };
    }
  };

  const generateTags = async (description?: string): Promise<boolean> => {
    setTagsStatus("loading");
    setTagsError(null);

    try {
      // Call the tags API
      // TODO: The API returns hardcoded responses when USE_AI_GENERATION=false
      // Set USE_AI_GENERATION=true in src/app/api/metadata/tags/route.ts for real AI
      const response = await generateTagsApi({
        hookText: hookText.trim(),
        tone,
        description, // Pass the provided description for context if available
      });

      setTags(response.tags);
      setTagsStatus("success");
      return true;
    } catch (error) {
      setTagsError(error instanceof Error ? error.message : ALERT_MESSAGES.TAGS_GENERATION_FAILED);
      setTagsStatus("error");
      return false;
    }
  };

  // Generate all metadata (thumbnails, description, tags)
  const canGenerateAll = (() => {
    // Check if at least one option is selected
    if (!generationOptions.thumbnails && !generationOptions.description && !generationOptions.tags) {
      return false;
    }
    // Only require file upload - hookText is optional
    if (sourceType === THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES && !hasVideoUploaded) return false;
    if (sourceType === THUMBNAIL_SOURCE_TYPES.IMAGES && (!hasImagesUploaded || assetIds.length === 0)) return false;
    return true;
  })();

  const generateThumbnailsSection = async (): Promise<boolean> => {
    setThumbnailsStatus("loading");
    setThumbnailsError(null);

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
      handleVariantsChange(newVariants);

      // Auto-select first variant if none selected
      if (!selectedVariantId && newVariants.length > 0) {
        setSelectedVariantId(newVariants[0].id);
      }

      setThumbnailsStatus("success");
      return true;
    } catch (error) {
      setThumbnailsError(error instanceof Error ? error.message : ALERT_MESSAGES.THUMBNAILS_GENERATION_FAILED);
      setThumbnailsStatus("error");
      return false;
    }
  };

  const handleGenerateAll = async () => {
    if (!canGenerateAll) return;

    setIsGeneratingAll(true);

    try {
      // Generate sections, ensuring description completes before tags for better context
      const promises: Promise<boolean>[] = [];
      let generatedDescription: string | undefined;

      // Start thumbnail generation (independent)
      if (generationOptions.thumbnails) {
        promises.push(generateThumbnailsSection());
      }

      // Generate description first (needed for tags context)
      if (generationOptions.description) {
        const descriptionResult = await generateDescription();
        generatedDescription = descriptionResult.description;
        promises.push(Promise.resolve(descriptionResult.success));
      }

      // Generate tags (can use newly generated description for better context)
      if (generationOptions.tags) {
        promises.push(generateTags(generatedDescription));
      }

      // Wait for all remaining generations to complete (don't fail if one fails)
      const results = await Promise.allSettled(promises);

      // Count successful generations from the settled results
      // Each generation function returns true on success, false on error
      const successCount = results.filter(
        (result) => result.status === 'fulfilled' && result.value === true
      ).length;

      if (successCount > 0) {
        setStatusAnnouncement(`Generation complete. ${successCount} section${successCount > 1 ? 's' : ''} successfully generated.`);
        // Clear announcement after screen readers have time to read it
        setTimeout(() => setStatusAnnouncement(''), 3000);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      // Error handling could be added here if needed for analytics/logging
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleSelectedVariantChange = (variantId: string | null) => {
    setSelectedVariantId(variantId);
  };


  // Handle file upload with asset ID from API
  const handleVideoUpload = (assetId: string) => {
    setHasVideoUploaded(true);
    setAssetIds([assetId]);
  };

  const handleImagesUpload = (assetId: string) => {
    setHasImagesUploaded(true);
    // For images, we can upload multiple files, so append to existing array
    setAssetIds((prev) => [...prev, assetId]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ARIA Live Region for Status Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {statusAnnouncement}
      </div>
      
      <div>
        <VideoInputPanel
          onSourceTypeChange={handleSourceTypeChange}
          onHookTextChange={handleHookTextChange}
          onVideoDescriptionChange={handleVideoDescriptionChange}
          onToneChange={handleToneChange}
          onFileUpload={(type, assetId) => {
            if (type === 'video') {
              handleVideoUpload(assetId);
            } else if (type === 'images') {
              handleImagesUpload(assetId);
            }
          }}
          hasVideoUploaded={hasVideoUploaded}
          hasImagesUploaded={hasImagesUploaded}
          onGenerate={handleGenerateAll}
          canGenerate={canGenerateAll}
          isGenerating={isGeneratingAll}
          generationOptions={generationOptions}
          onGenerationOptionsChange={setGenerationOptions}
        />
      </div>

      <div>
        <VideoPreviewPanel
          sourceType={sourceType}
          hookText={hookText}
          tone={tone}
          variants={variants}
          selectedVariantId={selectedVariantId}
          onVariantsChange={handleVariantsChange}
          onSelectedVariantChange={handleSelectedVariantChange}
          regenerationCount={regenerationCount}
          onRegenerationCountChange={setRegenerationCount}
          description={description}
          tags={tags}
          isGeneratingAll={isGeneratingAll}
          hasVideoUploaded={hasVideoUploaded}
          hasImagesUploaded={hasImagesUploaded}
          assetIds={assetIds}
          thumbnailsStatus={thumbnailsStatus}
          descriptionStatus={descriptionStatus}
          tagsStatus={tagsStatus}
          thumbnailsError={thumbnailsError}
          descriptionError={descriptionError}
          tagsError={tagsError}
          onRetryThumbnails={generateThumbnailsSection}
          onRetryDescription={generateDescription}
          onRetryTags={generateTags}
        />
      </div>
    </div>
  );
};
