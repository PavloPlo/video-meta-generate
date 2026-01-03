"use client";

import { useState } from "react";
import { VideoInputPanel, type GenerationOptions } from "@/components/molecules/VideoInputPanel";
import { VideoPreviewPanel } from "@/components/molecules/VideoPreviewPanel";
import { generateThumbnails } from "@/lib/thumbnails";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES, VALIDATION_RULES, ALERT_SCOPES, ALERT_KINDS } from "@/constants/video";
import { BUTTON_LABELS, ALERT_MESSAGES } from "@/constants/ui";
import type { ThumbnailVariant, SourceType, HookTone, InlineAlert, SectionStatus } from "@/lib/types/thumbnails";

export const VideoMetadataForm = () => {
  // Thumbnail variants state
  const [sourceType, setSourceType] = useState<SourceType>(THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES);
  const [hookText, setHookText] = useState("");
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

  const handleToneChange = (newTone: HookTone) => {
    setTone(newTone);
  };

  const handleVariantsChange = (newVariants: ThumbnailVariant[]) => {
    setVariants(newVariants);
  };

  const generateDescription = async () => {
    setDescriptionStatus("loading");
    setDescriptionError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate random failure for testing (10% chance)
      if (Math.random() < 0.1) {
        throw new Error("Failed to generate description");
      }

      const mockDescriptions = {
        viral: `🚀 ${hookText || 'This Changed Everything!'}

What you're about to discover will completely transform how you think about this topic. In this video, I break down the exact strategies that helped me achieve incredible results.

From complete beginner to expert level - here's exactly what worked for me and how you can apply it starting today.

Don't forget to like, subscribe, and hit that notification bell for more game-changing content! 🔥`,
        curiosity: `❓ ${hookText || 'You Won\'t Believe What I Found'}

Have you ever wondered why some people seem to have all the answers? Today, I'm diving deep into a discovery that completely changed my perspective.

What I uncovered might surprise you, but it could be the missing piece you've been looking for. Let's explore this together and see what we can learn.

Share your thoughts in the comments - what's your biggest takeaway from this?`,
        educational: `📚 ${hookText || 'The Complete Guide You\'ve Been Waiting For'}

Welcome to the most comprehensive guide on this topic. Whether you're just getting started or looking to deepen your knowledge, this video covers everything you need to know.

We'll break down complex concepts into simple, actionable steps that anyone can follow. By the end of this video, you'll have a clear understanding and practical skills you can implement immediately.

If you found this helpful, please give it a thumbs up and consider subscribing for more detailed tutorials!`
      };

      setDescription(mockDescriptions[tone]);
      setDescriptionStatus("success");
    } catch (error) {
      setDescriptionError(error instanceof Error ? error.message : ALERT_MESSAGES.DESCRIPTION_GENERATION_FAILED);
      setDescriptionStatus("error");
    }
  };

  const generateTags = async () => {
    setTagsStatus("loading");
    setTagsError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Simulate random failure for testing (10% chance)
      if (Math.random() < 0.1) {
        throw new Error("Failed to generate tags");
      }

      const baseTags = ['tutorial', 'guide', 'howto', 'tips', 'education'];
      const toneTags = {
        viral: ['viral', 'trending', 'mustwatch', 'gamechanger', 'lifechanging'],
        curiosity: ['interesting', 'discovery', 'mystery', 'explained', 'revealed'],
        educational: ['learn', 'study', 'knowledge', 'skills', 'masterclass']
      };

      setTags([...baseTags, ...toneTags[tone], '2024', 'new', 'best']);
      setTagsStatus("success");
    } catch (error) {
      setTagsError(error instanceof Error ? error.message : ALERT_MESSAGES.TAGS_GENERATION_FAILED);
      setTagsStatus("error");
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

  const generateThumbnailsSection = async () => {
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
    } catch (error) {
      setThumbnailsError(error instanceof Error ? error.message : ALERT_MESSAGES.THUMBNAILS_GENERATION_FAILED);
      setThumbnailsStatus("error");
    }
  };

  const handleGenerateAll = async () => {
    if (!canGenerateAll) return;

    setIsGeneratingAll(true);

    // Generate all selected sections in parallel
    const promises: Promise<void>[] = [];

    if (generationOptions.thumbnails) {
      promises.push(generateThumbnailsSection());
    }

    if (generationOptions.description) {
      promises.push(generateDescription());
    }

    if (generationOptions.tags) {
      promises.push(generateTags());
    }

    // Wait for all generations to complete (don't fail if one fails)
    await Promise.allSettled(promises);

    // Announce completion to screen readers
    const successCount = [
      generationOptions.thumbnails && thumbnailsStatus === 'success',
      generationOptions.description && descriptionStatus === 'success',
      generationOptions.tags && tagsStatus === 'success',
    ].filter(Boolean).length;

    if (successCount > 0) {
      setStatusAnnouncement(`Generation complete. ${successCount} section${successCount > 1 ? 's' : ''} successfully generated.`);
      // Clear announcement after screen readers have time to read it
      setTimeout(() => setStatusAnnouncement(''), 3000);
    }

    setIsGeneratingAll(false);
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
