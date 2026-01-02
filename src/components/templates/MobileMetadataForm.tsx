"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoInputPanel, type GenerationOptions } from "@/components/molecules/VideoInputPanel";
import { VideoPreviewPanel } from "@/components/molecules/VideoPreviewPanel";
import { Button } from "@/components/atoms/Button";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES } from "@/constants/video";
import { BUTTON_LABELS, MOBILE_TABS } from "@/constants/ui";
import type { ThumbnailVariant, SourceType, HookTone } from "@/lib/types/thumbnails";

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
    });
    const [isGenerating, setIsGenerating] = useState(false);

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

    const handleFileUpload = (type: 'video' | 'images') => {
        if (type === 'video') {
            updateSessionState({
                hasVideoUploaded: true,
                assetIds: ['video-1']
            });
        } else if (type === 'images') {
            updateSessionState({
                hasImagesUploaded: true,
                assetIds: ['image-1', 'image-2']
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
        
        const hasAssets = sessionState.hasVideoUploaded || sessionState.hasImagesUploaded;
        const hasTone = !!sessionState.tone;
        const hookTextValid = sessionState.hookText.length <= 200;
        return hasAssets && hasTone && hookTextValid;
    };

    const handleGenerate = async () => {
        if (!canGenerate()) return;
        setIsGenerating(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const updates: Partial<MobileSessionState> = {
                lastGeneratedAt: new Date(),
            };

            // Only generate thumbnails if the option is selected
            if (sessionState.generationOptions.thumbnails) {
                const mockVariants: ThumbnailVariant[] = [
                    { id: 'variant-1', imageUrl: '/api/placeholder/thumbnail-1' },
                    { id: 'variant-2', imageUrl: '/api/placeholder/thumbnail-2' },
                ];
                updates.variants = mockVariants;
                updates.selectedVariantId = mockVariants[0].id;
            }

            // Only generate description if the option is selected
            if (sessionState.generationOptions.description) {
                const mockDescriptions = {
                    viral: `${sessionState.hookText || 'This Changed Everything!'} What you're about to discover will completely transform how you think about this topic.`,
                    curiosity: `${sessionState.hookText || 'You Won\'t Believe What I Found'} Have you ever wondered why some people seem to have all the answers?`,
                    educational: `${sessionState.hookText || 'The Complete Guide You\'ve Been Waiting For'} Welcome to the most comprehensive guide on this topic.`
                };
                updates.description = mockDescriptions[sessionState.tone];
            }

            // Only generate tags if the option is selected
            if (sessionState.generationOptions.tags) {
                const baseTags = ['tutorial', 'guide', 'howto', 'tips', 'education'];
                const toneTags = {
                    viral: ['viral', 'trending', 'mustwatch', 'gamechanger', 'lifechanging'],
                    curiosity: ['interesting', 'discovery', 'mystery', 'explained', 'revealed'],
                    educational: ['learn', 'study', 'knowledge', 'skills', 'masterclass']
                };
                updates.tags = [...baseTags, ...toneTags[sessionState.tone], '2024', 'new', 'best'];
            }

            updateSessionState(updates);

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
            <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('inputs')}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'inputs'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    {MOBILE_TABS.INPUTS}
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'results'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    {MOBILE_TABS.RESULTS}
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'inputs' && (
                    <div className="h-full overflow-y-auto pb-24">
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
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-inset-bottom">
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
                    <div className="h-full overflow-hidden">
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
                        />
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-inset-bottom">
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