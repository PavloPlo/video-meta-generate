"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoInputPanel, type GenerationOptions } from "@/components/molecules/VideoInputPanel";
import { VideoPreviewPanel } from "@/components/molecules/VideoPreviewPanel";
import { Button } from "@/components/atoms/Button";
import { generateThumbnails } from "@/lib/thumbnails";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES, VALIDATION_RULES } from "@/constants/video";
import { BUTTON_LABELS, MOBILE_TABS, ALERT_MESSAGES } from "@/constants/ui";
import type { ThumbnailVariant, SourceType, HookTone, SectionStatus } from "@/lib/types/thumbnails";

interface MobileSessionState {
    sourceType: SourceType;
    hookText: string;
    tone: HookTone;
    hasVideoUploaded: boolean;
    hasImagesUploaded: boolean;
    assetIds: string[];
    variants: ThumbnailVariant[];
    selectedVariantId: string | null;
    regenerationCount: number;
    description: string;
    tags: string[];
    lastGeneratedAt?: Date;
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

    const generateThumbnailsSection = async () => {
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
        } catch (error) {
            updateSessionState({
                thumbnailsError: error instanceof Error ? error.message : ALERT_MESSAGES.THUMBNAILS_GENERATION_FAILED,
                thumbnailsStatus: "error",
            });
        }
    };

    const generateDescription = async () => {
        updateSessionState({ descriptionStatus: "loading", descriptionError: null });

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate random failure for testing (10% chance)
            if (Math.random() < 0.1) {
                throw new Error("Failed to generate description");
            }

            const mockDescriptions = {
                viral: `🚀 ${sessionState.hookText || 'This Changed Everything!'}

What you're about to discover will completely transform how you think about this topic. In this video, I break down the exact strategies that helped me achieve incredible results.`,
                curiosity: `❓ ${sessionState.hookText || 'You Won\'t Believe What I Found'}

Have you ever wondered why some people seem to have all the answers? Today, I'm diving deep into a discovery that completely changed my perspective.`,
                educational: `📚 ${sessionState.hookText || 'The Complete Guide You\'ve Been Waiting For'}

Welcome to the most comprehensive guide on this topic. Whether you're just getting started or looking to deepen your knowledge, this video covers everything you need to know.`
            };

            updateSessionState({
                description: mockDescriptions[sessionState.tone],
                descriptionStatus: "success",
            });
        } catch (error) {
            updateSessionState({
                descriptionError: error instanceof Error ? error.message : ALERT_MESSAGES.DESCRIPTION_GENERATION_FAILED,
                descriptionStatus: "error",
            });
        }
    };

    const generateTags = async () => {
        updateSessionState({ tagsStatus: "loading", tagsError: null });

        try {
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

            updateSessionState({
                tags: [...baseTags, ...toneTags[sessionState.tone], '2024', 'new', 'best'],
                tagsStatus: "success",
            });
        } catch (error) {
            updateSessionState({
                tagsError: error instanceof Error ? error.message : ALERT_MESSAGES.TAGS_GENERATION_FAILED,
                tagsStatus: "error",
            });
        }
    };

    const handleGenerate = async () => {
        if (!canGenerate()) return;
        setIsGenerating(true);

        try {
            updateSessionState({ lastGeneratedAt: new Date() });

            // Generate all selected sections in parallel
            const promises: Promise<void>[] = [];

            if (sessionState.generationOptions.thumbnails) {
                promises.push(generateThumbnailsSection());
            }

            if (sessionState.generationOptions.description) {
                promises.push(generateDescription());
            }

            if (sessionState.generationOptions.tags) {
                promises.push(generateTags());
            }

            // Wait for all generations to complete (don't fail if one fails)
            await Promise.allSettled(promises);

            // Announce completion to screen readers
            const successCount = [
                sessionState.generationOptions.thumbnails && sessionState.thumbnailsStatus === 'success',
                sessionState.generationOptions.description && sessionState.descriptionStatus === 'success',
                sessionState.generationOptions.tags && sessionState.tagsStatus === 'success',
            ].filter(Boolean).length;

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