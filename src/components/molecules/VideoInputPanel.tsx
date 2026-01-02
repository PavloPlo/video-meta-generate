"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { SourceSelector } from "@/components/atoms/SourceSelector";
import { HookTextControls } from "@/components/molecules/HookTextControls";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES } from "@/constants/video";
import type { SourceType, HookTone, InlineAlert } from "@/lib/types/thumbnails";

export interface VideoInputPanelProps {
  onSourceTypeChange?: (sourceType: SourceType) => void;
  onHookTextChange?: (hookText: string) => void;
  onToneChange?: (tone: HookTone) => void;
  onInlineAlert?: (alert: InlineAlert | null) => void;
  hasVideoUploaded?: boolean;
  hasImagesUploaded?: boolean;
}

export const VideoInputPanel = ({
  onSourceTypeChange,
  onHookTextChange,
  onToneChange,
  onInlineAlert,
  hasVideoUploaded = false,
  hasImagesUploaded = false,
}: VideoInputPanelProps) => {
  const [sourceType, setSourceType] = useState<SourceType>(THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES);
  const [hookText, setHookText] = useState("");
  const [tone, setTone] = useState<HookTone>(HOOK_TONES.VIRAL);
  const [inlineAlert, setInlineAlert] = useState<InlineAlert | null>(null);

  const handleSourceTypeChange = (newSourceType: SourceType) => {
    setSourceType(newSourceType);
    onSourceTypeChange?.(newSourceType);

    // Show alert when source changes
    const alert: InlineAlert = {
      scope: 'source',
      kind: 'info',
      message: `Source set to ${newSourceType === THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES ? 'video frames' : 'uploaded images'}`,
    };
    setInlineAlert(alert);
    onInlineAlert?.(alert);

    // Clear alert after a delay
    setTimeout(() => {
      setInlineAlert(null);
      onInlineAlert?.(null);
    }, 3000);
  };

  const handleHookTextChange = (newHookText: string) => {
    setHookText(newHookText);
    onHookTextChange?.(newHookText);
  };

  const handleToneChange = (newTone: HookTone) => {
    setTone(newTone);
    onToneChange?.(newTone);

    // Show alert when tone changes
    const alert: InlineAlert = {
      scope: 'controls',
      kind: 'info',
      message: `Tone set to ${newTone}`,
    };
    setInlineAlert(alert);
    onInlineAlert?.(alert);

    // Clear alert after a delay
    setTimeout(() => {
      setInlineAlert(null);
      onInlineAlert?.(null);
    }, 3000);
  };

  const handleAlertDismiss = () => {
    setInlineAlert(null);
    onInlineAlert?.(null);
  };

  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] h-full flex flex-col">
      <CardHeader>
        <CardTitle id="inputs-heading">Create thumbnails</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-8">
        {/* Step 1: Choose source */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              1
            </div>
            <h3 className="text-sm font-medium text-slate-900">Choose source</h3>
          </div>
          <SourceSelector
            value={sourceType}
            onChange={handleSourceTypeChange}
            hasVideoUploaded={hasVideoUploaded}
            hasImagesUploaded={hasImagesUploaded}
          />
        </div>

        {/* Step 2: Write hook text */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              2
            </div>
            <h3 className="text-sm font-medium text-slate-900">Write hook text</h3>
          </div>
          <div className="pl-9">
            <HookTextControls
              hookText={hookText}
              onHookTextChange={handleHookTextChange}
              tone={tone}
              onToneChange={handleToneChange}
              inlineAlert={inlineAlert}
              onAlertDismiss={handleAlertDismiss}
            />
          </div>
        </div>

        {/* Step 3: Choose tone - embedded in hook controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              3
            </div>
            <h3 className="text-sm font-medium text-slate-900">Choose tone</h3>
          </div>
          <p className="pl-9 text-sm text-slate-600">
            Tone selector is integrated above in the hook text section
          </p>
        </div>

        {/* Step 4: Generate thumbnails */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              4
            </div>
            <h3 className="text-sm font-medium text-slate-900">Generate thumbnails</h3>
          </div>
          <p className="pl-9 text-sm text-slate-600">
            Click the &ldquo;Generate thumbnails&rdquo; button in the Preview panel to create your variants
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
