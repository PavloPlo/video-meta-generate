"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { ThumbnailVariantsPanel } from "@/components/organisms/ThumbnailVariantsPanel";
import { InlineAlert as InlineAlertComponent } from "@/components/atoms/InlineAlert";
import type { ThumbnailVariant, SourceType, HookTone, InlineAlert as InlineAlertType } from "@/lib/types/thumbnails";

export interface VideoPreviewPanelProps {
  sourceType: SourceType;
  hookText: string;
  tone: HookTone;
  variants: ThumbnailVariant[];
  selectedVariantId: string | null;
  onVariantsChange: (variants: ThumbnailVariant[]) => void;
  onSelectedVariantChange: (variantId: string | null) => void;
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
  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] h-full flex flex-col">
      <CardHeader>
        <CardTitle id="preview-heading">Generated Metadata</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 overflow-y-auto">
        {/* Thumbnails Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
            Thumbnails
          </h3>
          <div className="pl-10">
            <ThumbnailVariantsPanel
              sourceType={sourceType}
              hookText={hookText}
              tone={tone}
              variants={variants}
              selectedVariantId={selectedVariantId}
              onVariantsChange={onVariantsChange}
              onSelectedVariantChange={onSelectedVariantChange}
              onInlineAlert={handleInlineAlert}
              hasVideoUploaded={hasVideoUploaded}
              hasImagesUploaded={hasImagesUploaded}
              assetIds={assetIds}
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">2</span>
            Description
          </h3>
          <div className="pl-10">
            {description ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                    Copy
                  </button>
                  <button className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                <div className="text-slate-500">
                  {isGeneratingAll ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                      Generating description...
                    </div>
                  ) : (
                    <p>Description will appear here after generation</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
            Tags
          </h3>
          <div className="pl-10">
            {tags.length > 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                    Copy All
                  </button>
                  <button className="text-xs px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                <div className="text-slate-500">
                  {isGeneratingAll ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                      Generating tags...
                    </div>
                  ) : (
                    <p>Tags will appear here after generation</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed alert slot for generate actions */}
        <div className="min-h-[2.5rem] flex items-start">
          {generateAlert && (
            <InlineAlertComponent
              scope={generateAlert.scope}
              kind={generateAlert.kind}
              message={generateAlert.message}
              isVisible={generateAlert.isVisible}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
