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
        <CardTitle id="preview-heading">Thumbnail Variants</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
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
          className="h-full"
        />

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
