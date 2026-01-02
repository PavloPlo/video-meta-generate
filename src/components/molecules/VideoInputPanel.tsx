"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { SourceSelector } from "@/components/atoms/SourceSelector";
import { HookTextControls } from "@/components/molecules/HookTextControls";
import { InlineAlert as InlineAlertComponent } from "@/components/atoms/InlineAlert";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES } from "@/constants/video";
import type { SourceType, HookTone, InlineAlert } from "@/lib/types/thumbnails";

export interface VideoInputPanelProps {
  onSourceTypeChange?: (sourceType: SourceType) => void;
  onHookTextChange?: (hookText: string) => void;
  onToneChange?: (tone: HookTone) => void;
  onFileUpload?: (type: 'video' | 'images') => void;
  hasVideoUploaded?: boolean;
  hasImagesUploaded?: boolean;
}

export const VideoInputPanel = ({
  onSourceTypeChange,
  onHookTextChange,
  onToneChange,
  onFileUpload,
  hasVideoUploaded = false,
  hasImagesUploaded = false,
}: VideoInputPanelProps) => {
  const [sourceType, setSourceType] = useState<SourceType>(THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES);
  const [hookText, setHookText] = useState("");
  const [tone, setTone] = useState<HookTone>(HOOK_TONES.VIRAL);
  const [sourceAlert, setSourceAlert] = useState<InlineAlert | null>(null);
  const [sourceValidationMessage, setSourceValidationMessage] = useState<string | null>(null);

  const handleSourceTypeChange = (newSourceType: SourceType) => {
    setSourceType(newSourceType);
    onSourceTypeChange?.(newSourceType);

    // Show alert when source changes
    const alert: InlineAlert = {
      scope: 'source',
      kind: 'info',
      message: `Source set to ${newSourceType === THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES ? 'video frames' : 'uploaded images'}`,
      isVisible: true,
    };
    setSourceAlert(alert);

    // Clear alert after a delay (except for errors)
    if (alert.kind !== 'error') {
      setTimeout(() => {
        setSourceAlert({ ...alert, isVisible: false });
        setTimeout(() => setSourceAlert(null), 200); // Wait for fade out
      }, 3000);
    }
  };

  const handleHookTextChange = (newHookText: string) => {
    setHookText(newHookText);
    onHookTextChange?.(newHookText);
  };

  const handleToneChange = (newTone: HookTone) => {
    setTone(newTone);
    onToneChange?.(newTone);
  };

  return (
    <Card className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] h-full flex flex-col">
      <CardHeader>
        <CardTitle id="inputs-heading">Create thumbnails</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {/* Step 1: Choose source */}
        <div className="space-y-4">
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
            onValidationChange={setSourceValidationMessage}
            onFileUpload={onFileUpload}
          />
          {/* Fixed alert slot for source */}
          <div className="min-h-[2.5rem] flex items-start">
            {sourceValidationMessage ? (
              <InlineAlertComponent
                scope="source"
                kind="warning"
                message={sourceValidationMessage}
                isVisible={true}
              />
            ) : sourceAlert ? (
              <InlineAlertComponent
                scope={sourceAlert.scope}
                kind={sourceAlert.kind}
                message={sourceAlert.message}
                isVisible={sourceAlert.isVisible}
              />
            ) : null}
          </div>
        </div>

        {/* Step 2: Write hook text */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              2
            </div>
            <h3 className="text-sm font-medium text-slate-900">Write hook text or leave empty for optimized suggestion</h3>
          </div>
          <div className="pl-9">
            <HookTextControls
              hookText={hookText}
              onHookTextChange={handleHookTextChange}
            />
          </div>
        </div>

        {/* Step 3: Choose tone */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              3
            </div>
            <h3 className="text-sm font-medium text-slate-900">Choose tone</h3>
          </div>
          <div className="pl-9">
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: HOOK_TONES.VIRAL,
                  label: "Viral",
                  description: "Attention-grabbing and shareable",
                  icon: "🔥",
                  color: "text-red-600"
                },
                {
                  value: HOOK_TONES.CURIOSITY,
                  label: "Curiosity",
                  description: "Spark interest and questions",
                  icon: "❓",
                  color: "text-blue-600"
                },
                {
                  value: HOOK_TONES.EDUCATIONAL,
                  label: "Educational",
                  description: "Informative and helpful",
                  icon: "🎓",
                  color: "text-green-600"
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToneChange(option.value)}
                  className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${tone === option.value
                      ? "border-slate-600 bg-slate-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-25"
                    }`}
                >
                  <div className={`text-2xl mb-2 ${option.color}`}>{option.icon}</div>
                  <div className="font-semibold text-slate-900 text-sm">{option.label}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-tight">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
