"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { ThumbnailVariantsPanel } from "@/components/organisms/ThumbnailVariantsPanel";
import { InlineAlert as InlineAlertComponent } from "@/components/atoms/InlineAlert";
import { GENERATION_HELPER } from "@/constants/ui";
import type { ThumbnailVariant, SourceType, HookTone, InlineAlert as InlineAlertType } from "@/lib/types/thumbnails";

export interface VideoPreviewPanelProps {
  sourceType: SourceType;
  hookText: string;
  tone: HookTone;
  variants: ThumbnailVariant[];
  selectedVariantId: string | null;
  onVariantsChange: (variants: ThumbnailVariant[]) => void;
  onSelectedVariantChange: (variantId: string | null) => void;
  regenerationCount: number;
  onRegenerationCountChange: (count: number | ((prev: number) => number)) => void;
  description: string;
  tags: string[];
  isGeneratingAll?: boolean;
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
  regenerationCount,
  onRegenerationCountChange,
  description,
  tags,
  isGeneratingAll = false,
  hasVideoUploaded = false,
  hasImagesUploaded = false,
  assetIds = [],
}: VideoPreviewPanelProps) => {
  const [generateAlert, setGenerateAlert] = useState<InlineAlertType | null>(null);

  const handleInlineAlert = (alert: InlineAlertType | null) => {
    if (alert) {
      const alertWithVisibility: InlineAlertType = {
        ...alert,
        isVisible: true,
      };
      setGenerateAlert(alertWithVisibility);

      // Clear alert after a delay (except for errors)
      if (alert.kind !== 'error') {
        setTimeout(() => {
          setGenerateAlert({ ...alertWithVisibility, isVisible: false });
          setTimeout(() => setGenerateAlert(null), 200); // Wait for fade out
        }, 3000);
      }
    } else {
      setGenerateAlert(null);
    }
  };
  // Check if nothing has been generated yet
  const hasNoContent = variants.length === 0 && !description && tags.length === 0;

  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] h-full flex flex-col">
      <CardHeader>
        <CardTitle id="preview-heading">Generated Metadata</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {/* Empty state guidance when nothing has been generated */}
        {hasNoContent && !isGeneratingAll && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">What happens next?</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {GENERATION_HELPER.WHAT_HAPPENS_NEXT}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Thumbnails Section */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="text-blue-600">📸</span>
            Thumbnails
          </h3>
          <div>
            <ThumbnailVariantsPanel
              sourceType={sourceType}
              hookText={hookText}
              tone={tone}
              variants={variants}
              selectedVariantId={selectedVariantId}
              onVariantsChange={onVariantsChange}
              onSelectedVariantChange={onSelectedVariantChange}
              regenerationCount={regenerationCount}
              onRegenerationCountChange={onRegenerationCountChange}
              onInlineAlert={handleInlineAlert}
              hasVideoUploaded={hasVideoUploaded}
              hasImagesUploaded={hasImagesUploaded}
              assetIds={assetIds}
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="text-green-600">📝</span>
            Description
          </h3>
          <div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-h-[120px] flex flex-col">
              {description ? (
                <>
                  <div className="prose prose-sm max-w-none flex-1">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                  </div>
                  <div className="mt-3 flex gap-2 shrink-0">
                    <button className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                      Copy
                    </button>
                    <button className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                      Edit
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="text-slate-500">
                    {isGeneratingAll ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                        Generating description...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600">Your optimized description will appear here</p>
                        <p className="text-xs text-slate-500">Complete the requirements and click Generate</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="text-purple-600">🏷️</span>
            Tags
          </h3>
          <div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-h-[120px] flex flex-col">
              {tags.length > 0 ? (
                <>
                  <div className="flex-1 flex flex-wrap gap-2 content-start">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2 shrink-0">
                    <button className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                      Copy All
                    </button>
                    <button className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                      Edit
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="text-slate-500">
                    {isGeneratingAll ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                        Generating tags...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600">Your optimized tags will appear here</p>
                        <p className="text-xs text-slate-500">Complete the requirements and click Generate</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed alert slot for generate actions */}
        <div className="h-10 flex items-start mt-6">
          {generateAlert ? (
            <InlineAlertComponent
              scope={generateAlert.scope}
              kind={generateAlert.kind}
              message={generateAlert.message}
              isVisible={generateAlert.isVisible}
            />
          ) : (
            <div className="h-10" aria-hidden="true" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
