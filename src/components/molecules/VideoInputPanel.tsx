"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { HookTextControls } from "@/components/molecules/HookTextControls";
import { InlineAlert as InlineAlertComponent } from "@/components/atoms/InlineAlert";
import { THUMBNAIL_SOURCE_TYPES, HOOK_TONES } from "@/constants/video";
import { BUTTON_LABELS, GENERATION_HELPER, CHECKLIST_LABELS } from "@/constants/ui";
import type { SourceType, HookTone, InlineAlert } from "@/lib/types/thumbnails";

export interface GenerationOptions {
  thumbnails: boolean;
  description: boolean;
  tags: boolean;
}

export interface VideoInputPanelProps {
  onSourceTypeChange?: (sourceType: SourceType) => void;
  onHookTextChange?: (hookText: string) => void;
  onToneChange?: (tone: HookTone) => void;
  onFileUpload?: (type: 'video' | 'images') => void;
  hasVideoUploaded?: boolean;
  hasImagesUploaded?: boolean;
  onGenerate?: () => void;
  canGenerate?: boolean;
  isGenerating?: boolean;
  generationOptions?: GenerationOptions;
  onGenerationOptionsChange?: (options: GenerationOptions) => void;
}

export const VideoInputPanel = ({
  onSourceTypeChange,
  onHookTextChange,
  onToneChange,
  onFileUpload,
  hasVideoUploaded = false,
  hasImagesUploaded = false,
  onGenerate,
  canGenerate = false,
  isGenerating = false,
  generationOptions = { thumbnails: true, description: true, tags: true },
  onGenerationOptionsChange,
}: VideoInputPanelProps) => {
  const [sourceType, setSourceType] = useState<SourceType>(THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES);
  const [hookText, setHookText] = useState("");
  const [tone, setTone] = useState<HookTone>(HOOK_TONES.VIRAL);
  const [sourceAlert, setSourceAlert] = useState<InlineAlert | null>(null);

  const handleFileChange = (file: File) => {
    const isVideo = file.type.startsWith('video/');
    const newSourceType = isVideo ? THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES : THUMBNAIL_SOURCE_TYPES.IMAGES;
    setSourceType(newSourceType);
    onSourceTypeChange?.(newSourceType);
    onFileUpload?.(isVideo ? 'video' : 'images');

    // Show alert when file is uploaded
    const alert: InlineAlert = {
      scope: 'source',
      kind: 'info',
      message: `${file.name} uploaded successfully`,
      isVisible: true,
    };
    setSourceAlert(alert);

    // Clear alert after a delay
    setTimeout(() => {
      setSourceAlert({ ...alert, isVisible: false });
      setTimeout(() => setSourceAlert(null), 200);
    }, 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
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
        <CardTitle id="inputs-heading">Generate Metadata</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pb-0">
        {/* Step 1: Upload file */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              1
            </div>
            <h3 className="text-sm font-medium text-slate-900">Upload file</h3>
          </div>
          <div className="pl-9">
            <label className="block">
              <div
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-slate-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 text-center px-4">
                    Accepts video files (MP4, MOV, AVI, WebM) or image files (JPG, PNG, GIF, WebP)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileChange(file);
                    }
                  }}
                />
              </div>
            </label>
          </div>
          {/* Alert slot for source */}
          {sourceAlert && (
            <div className="flex items-start">
              <InlineAlertComponent
                scope={sourceAlert.scope}
                kind={sourceAlert.kind}
                message={sourceAlert.message}
                isVisible={sourceAlert.isVisible}
              />
            </div>
          )}
        </div>

        {/* Step 2: Write hook text */}
        <div className="space-y-3">
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
        <div className="space-y-3">
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

        {/* Step 4: Select what to generate */}
        {onGenerationOptionsChange && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                4
              </div>
              <h3 className="text-sm font-medium text-slate-900">Select what to generate</h3>
            </div>
            <div className="pl-9">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={generationOptions.thumbnails}
                    onChange={(e) => onGenerationOptionsChange({
                      ...generationOptions,
                      thumbnails: e.target.checked,
                    })}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  />
                  <span className="text-sm font-medium text-slate-900 group-hover:text-slate-700">
                    Thumbnails
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={generationOptions.description}
                    onChange={(e) => onGenerationOptionsChange({
                      ...generationOptions,
                      description: e.target.checked,
                    })}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  />
                  <span className="text-sm font-medium text-slate-900 group-hover:text-slate-700">
                    Description
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={generationOptions.tags}
                    onChange={(e) => onGenerationOptionsChange({
                      ...generationOptions,
                      tags: e.target.checked,
                    })}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  />
                  <span className="text-sm font-medium text-slate-900 group-hover:text-slate-700">
                    Tags
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Checklist and Generate Button */}
        {onGenerate && (
          <div className="pt-6 border-t border-slate-200 space-y-4">
            {/* Requirements Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-medium text-slate-600 uppercase tracking-wider">Requirements</h4>
              <div className="space-y-2">
                {/* File uploaded - Required */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                    hasVideoUploaded || hasImagesUploaded 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {(hasVideoUploaded || hasImagesUploaded) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${
                    hasVideoUploaded || hasImagesUploaded 
                      ? 'text-slate-700 font-medium' 
                      : 'text-slate-500'
                  }`}>
                    {CHECKLIST_LABELS.FILE_UPLOADED}
                    <span className="ml-1.5 text-xs font-semibold text-red-600">*</span>
                  </span>
                </div>

                {/* Hook text - Optional */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                    hookText.trim() 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {hookText.trim() && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${
                    hookText.trim() 
                      ? 'text-slate-700 font-medium' 
                      : 'text-slate-500'
                  }`}>
                    {CHECKLIST_LABELS.HOOK_TEXT}
                    <span className="ml-1.5 text-xs text-slate-400">(optional)</span>
                  </span>
                </div>

                {/* Tone selected - Optional */}
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                    tone 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {tone && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${
                    tone 
                      ? 'text-slate-700 font-medium' 
                      : 'text-slate-500'
                  }`}>
                    {CHECKLIST_LABELS.TONE_SELECTED}
                    <span className="ml-1.5 text-xs text-slate-400">(optional)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="relative group">
              <Button
                onClick={onGenerate}
                disabled={!canGenerate || isGenerating}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                {isGenerating ? BUTTON_LABELS.GENERATING_METADATA : BUTTON_LABELS.GENERATE_METADATA}
              </Button>
              {/* Helper text when disabled */}
              {!canGenerate && !isGenerating && (
                <div className="mt-2 text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {GENERATION_HELPER.UPLOAD_FILE_TO_CONTINUE}
                </div>
              )}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};
