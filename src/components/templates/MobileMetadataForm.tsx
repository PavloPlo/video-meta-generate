"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoInputPanel, type GenerationOptions } from "@/components/molecules/VideoInputPanel";
import { VideoPreviewPanel } from "@/components/molecules/VideoPreviewPanel";
import { Button } from "@/components/atoms/Button";
import { generateThumbnails } from "@/lib/thumbnails";
import { generateDescription as generateDescriptionApi, generateTags as generateTagsApi } from "@/lib/metadata";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES, VALIDATION_RULES } from "@/constants/video";
import { BUTTON_LABELS, MOBILE_TABS, ALERT_MESSAGES } from "@/constants/ui";
import type { ThumbnailVariant, SourceType, HookTone, SectionStatus } from "@/lib/types/thumbnails";

interface MobileSessionState {
    sourceType: SourceType;
    hookText: string;
    videoDescription: string;
    tone: HookTone;
    hasVideoUploaded: boolean;
    hasImagesUploaded: boolean;
    assetIds: string[];
    variants: ThumbnailVariant[];
    selectedVariantId: string | null;
    regenerationCount: number;
    description: string;
    tags: string[];
    // Stored as ISO string in localStorage, converted to Date when restored
    lastGeneratedAt?: string;
    generationOptions: GenerationOptions;
    thumbnailsStatus: SectionStatus;
    descriptionStatus: SectionStatus;
    tagsStatus: SectionStatus;
    thumbnailsError: string | null;
    descriptionError: string | null;
    tagsError: string | null;
}

const STORAGE_KEY = 'mobile_metadata_session';

export const MobileMetadataForm = () => {
    const [activeTab, setActiveTab] = useState<'inputs' | 'results'>('inputs');
    const [sessionState, setSessionState] = useState<MobileSessionState>({
        sourceType: THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES,
        hookText: '',
        videoDescription: '',
        tone: HOOK_TONES.VIRAL,
        hasVideoUploaded: false,
        hasImagesUploaded: false,
        assetIds: [],
        variants: [],
        selectedVariantId: null,
        regenerationCount: 0,
        description: '',
        tags: [],
        generationOptions: {
            thumbnails: true,
            description: true,
            tags: true,
        },
        thumbnailsStatus: "idle",
        descriptionStatus: "idle",
        tagsStatus: "idle",
        thumbnailsError: null,
        descriptionError: null,
        tagsError: null,
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [statusAnnouncement, setStatusAnnouncement] = useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsedState = JSON.parse(saved);
                    setSessionState(parsedState);
                    if (parsedState.variants.length > 0 || parsedState.description) {
                        setActiveTab('results');
                    }
                } catch (error) {
                    console.warn('Failed to parse saved session state:', error);
                }
            }
        }
    }, []);

    const updateSessionState = useCallback((updates: Partial<MobileSessionState>) => {
        setSessionState(prev => {
            const newState = { ...prev, ...updates };
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            }
            return newState;
        });
    }, []);

    const handleSourceTypeChange = (sourceType: SourceType) => {
        updateSessionState({ sourceType });
    };

    const handleHookTextChange = (hookText: string) => {
        updateSessionState({ hookText });
    };

    const handleVideoDescriptionChange = (videoDescription: string) => {
        updateSessionState({ videoDescription });
    };

    const handleToneChange = (tone: HookTone) => {
        updateSessionState({ tone });
    };

    const handleFileUpload = (type: 'video' | 'images', assetId: string) => {
        if (type === 'video') {
            updateSessionState({
                hasVideoUploaded: true,
                assetIds: [assetId]
            });
        } else if (type === 'images') {
            setSessionState((prev) => {
                const newState = {
                    ...prev,
                    hasImagesUploaded: true,
                    assetIds: [...(prev.assetIds || []), assetId]
                };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
                }
                return newState;
            });
        }
    };

    const handleGenerationOptionsChange = (options: GenerationOptions) => {
        updateSessionState({ generationOptions: options });
    };

    const canGenerate = () => {
        // Check if at least one option is selected
        const hasOptionSelected = sessionState.generationOptions.thumbnails || 
                                   sessionState.generationOptions.description || 
                                   sessionState.generationOptions.tags;
        if (!hasOptionSelected) return false;
        
        // Only require file upload - hookText and tone are optional but hookText has length validation
        const hasAssets = sessionState.hasVideoUploaded || sessionState.hasImagesUploaded;
        const hookTextValid = sessionState.hookText.length <= 200;
        return hasAssets && hookTextValid;
    };

    const generateThumbnailsSection = async (): Promise<boolean> => {
        updateSessionState({ thumbnailsStatus: "loading", thumbnailsError: null });

        try {
            const response = await generateThumbnails({
                hookText: sessionState.hookText.trim(),
                tone: sessionState.tone,
                source: {
                    type: sessionState.sourceType,
                    assetIds: sessionState.assetIds,
                },
                count: VALIDATION_RULES.THUMBNAIL_VARIANTS_INITIAL,
            });

            const newVariants = response.variants.slice(0, VALIDATION_RULES.THUMBNAIL_VARIANTS_MAX);
            updateSessionState({
                variants: newVariants,
                selectedVariantId: newVariants.length > 0 ? newVariants[0].id : null,
                thumbnailsStatus: "success",
            });
            return true;
        } catch (error) {
            updateSessionState({
                thumbnailsError: error instanceof Error ? error.message : ALERT_MESSAGES.THUMBNAILS_GENERATION_FAILED,
                thumbnailsStatus: "error",
            });
            return false;
        }
    };

    const generateDescription = async (): Promise<{ success: boolean; description?: string }> => {
        updateSessionState({ descriptionStatus: "loading", descriptionError: null });

        try {
            // Call the description API
            // TODO: The API returns hardcoded responses when USE_AI_GENERATION=false
            // Set USE_AI_GENERATION=true in src/app/api/metadata/description/route.ts for real AI
            const response = await generateDescriptionApi({
                hookText: sessionState.hookText.trim(),
                tone: sessionState.tone,
                // Pass videoDescription as additional context when hookText is empty
                videoDescription: sessionState.videoDescription.trim() || undefined,
            });

            updateSessionState({
                description: response.description,
                descriptionStatus: "success",
            });
            return { success: true, description: response.description };
        } catch (error) {
            updateSessionState({
                descriptionError: error instanceof Error ? error.message : ALERT_MESSAGES.DESCRIPTION_GENERATION_FAILED,
                descriptionStatus: "error",
            });
            return { success: false };
        }
    };

    const generateTags = async (description?: string): Promise<boolean> => {
        updateSessionState({ tagsStatus: "loading", tagsError: null });

        try {
            // Call the tags API
            // TODO: The API returns hardcoded responses when USE_AI_GENERATION=false
            // Set USE_AI_GENERATION=true in src/app/api/metadata/tags/route.ts for real AI
            const response = await generateTagsApi({
                hookText: sessionState.hookText.trim(),
                tone: sessionState.tone,
                description, // Pass the provided description for context if available
            });

            updateSessionState({
                tags: response.tags,
                tagsStatus: "success",
            });
            return true;
        } catch (error) {
            updateSessionState({
                tagsError: error instanceof Error ? error.message : ALERT_MESSAGES.TAGS_GENERATION_FAILED,
                tagsStatus: "error",
            });
            return false;
        }
    };

    const handleGenerate = async () => {
        if (!canGenerate()) return;
        setIsGenerating(true);

        try {
            updateSessionState({ lastGeneratedAt: new Date().toISOString() });

            // Generate sections, ensuring description completes before tags for better context
            const promises: Promise<boolean>[] = [];
            let descriptionSuccess = false;

            // Start thumbnail generation (independent)
            if (sessionState.generationOptions.thumbnails) {
                promises.push(generateThumbnailsSection());
            }

            // Generate description first (needed for tags context)
            let generatedDescription: string | undefined;
            if (sessionState.generationOptions.description) {
                const descriptionResult = await generateDescription();
                descriptionSuccess = descriptionResult.success;
                generatedDescription = descriptionResult.description;
                promises.push(Promise.resolve(descriptionSuccess));
            }

            // Generate tags (can use newly generated description for better context)
            if (sessionState.generationOptions.tags) {
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

            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'mobile_generation_success', {
                    tone: sessionState.tone,
                    source_type: sessionState.sourceType,
                    has_hook_text: sessionState.hookText.length > 0,
                    generation_options: sessionState.generationOptions,
                });
            }

            setActiveTab('results');
        } catch (error) {
            console.error('Generation failed:', error);
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'mobile_generation_failed', {
                    tone: sessionState.tone,
                    source_type: sessionState.sourceType,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleVariantsChange = (variants: ThumbnailVariant[]) => {
        updateSessionState({ variants });
    };

    const handleSelectedVariantChange = (selectedVariantId: string | null) => {
        updateSessionState({ selectedVariantId });
    };

    const handleRegenerationCountChange = (count: number | ((prev: number) => number)) => {
        const newCount = typeof count === 'function' ? count(sessionState.regenerationCount) : count;
        updateSessionState({ regenerationCount: newCount });
    };

    return (
        <div className="flex flex-col h-full max-h-screen">
            {/* ARIA Live Region for Status Announcements */}
            <div 
                role="status" 
                aria-live="polite" 
                aria-atomic="true"
                className="sr-only"
            >
                {statusAnnouncement}
            </div>
            
            <div className="flex border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm" role="tablist" aria-label="Metadata generation sections">
                <button
                    role="tab"
                    aria-selected={activeTab === 'inputs'}
                    aria-controls="inputs-panel"
                    id="inputs-tab"
                    onClick={() => setActiveTab('inputs')}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            setActiveTab('results');
                            document.getElementById('results-tab')?.focus();
                        }
                    }}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset focus-visible:z-10 ${activeTab === 'inputs'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                >
                    {MOBILE_TABS.INPUTS}
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === 'results'}
                    aria-controls="results-panel"
                    id="results-tab"
                    onClick={() => setActiveTab('results')}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            setActiveTab('inputs');
                            document.getElementById('inputs-tab')?.focus();
                        }
                    }}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset focus-visible:z-10 ${activeTab === 'results'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                >
                    {MOBILE_TABS.RESULTS}
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'inputs' && (
                    <div 
                        id="inputs-panel"
                        role="tabpanel"
                        aria-labelledby="inputs-tab"
                        className="h-full overflow-y-auto pb-24"
                    >
                        <VideoInputPanel
                            onSourceTypeChange={handleSourceTypeChange}
                            onHookTextChange={handleHookTextChange}
                            onVideoDescriptionChange={handleVideoDescriptionChange}
                            onToneChange={handleToneChange}
                            onFileUpload={handleFileUpload}
                            hasVideoUploaded={sessionState.hasVideoUploaded}
                            hasImagesUploaded={sessionState.hasImagesUploaded}
                            generationOptions={sessionState.generationOptions}
                            onGenerationOptionsChange={handleGenerationOptionsChange}
                        />
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-30 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                            <Button
                                onClick={handleGenerate}
                                disabled={!canGenerate() || isGenerating}
                                className="w-full"
                                size="lg"
                            >
                                {isGenerating
                                    ? BUTTON_LABELS.GENERATING_METADATA
                                    : canGenerate()
                                        ? BUTTON_LABELS.GENERATE_METADATA
                                        : BUTTON_LABELS.GENERATE_METADATA_DISABLED
                                }
                            </Button>
                        </div>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div 
                        id="results-panel"
                        role="tabpanel"
                        aria-labelledby="results-tab"
                        className="h-full overflow-hidden"
                    >
                        <VideoPreviewPanel
                            sourceType={sessionState.sourceType}
                            hookText={sessionState.hookText}
                            tone={sessionState.tone}
                            variants={sessionState.variants}
                            selectedVariantId={sessionState.selectedVariantId}
                            onVariantsChange={handleVariantsChange}
                            onSelectedVariantChange={handleSelectedVariantChange}
                            regenerationCount={sessionState.regenerationCount}
                            onRegenerationCountChange={handleRegenerationCountChange}
                            description={sessionState.description}
                            tags={sessionState.tags}
                            hasVideoUploaded={sessionState.hasVideoUploaded}
                            hasImagesUploaded={sessionState.hasImagesUploaded}
                            assetIds={sessionState.assetIds}
                            thumbnailsStatus={sessionState.thumbnailsStatus}
                            descriptionStatus={sessionState.descriptionStatus}
                            tagsStatus={sessionState.tagsStatus}
                            thumbnailsError={sessionState.thumbnailsError}
                            descriptionError={sessionState.descriptionError}
                            tagsError={sessionState.tagsError}
                            onRetryThumbnails={generateThumbnailsSection}
                            onRetryDescription={generateDescription}
                            onRetryTags={generateTags}
                            useAccordions={true}
                        />
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-30 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                            <Button
                                onClick={() => setActiveTab('inputs')}
                                variant="outline"
                                className="w-full"
                                size="lg"
                            >
                                {BUTTON_LABELS.EDIT_INPUTS}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};