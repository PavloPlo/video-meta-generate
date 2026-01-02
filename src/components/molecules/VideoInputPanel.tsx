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
    <Card className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)]">
      <CardHeader>
        <CardTitle id="inputs-heading">Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SourceSelector
          value={sourceType}
          onChange={handleSourceTypeChange}
          hasVideoUploaded={hasVideoUploaded}
          hasImagesUploaded={hasImagesUploaded}
        />

        <HookTextControls
          hookText={hookText}
          onHookTextChange={handleHookTextChange}
          tone={tone}
          onToneChange={handleToneChange}
          inlineAlert={inlineAlert}
          onAlertDismiss={handleAlertDismiss}
        />
      </CardContent>
    </Card>
  );
};
