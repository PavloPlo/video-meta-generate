import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { THUMBNAIL_SOURCE_TYPES } from "@/constants/video";
import type { SourceType } from "@/lib/types/thumbnails";

export interface SourceSelectorProps {
  value: SourceType;
  onChange: (value: SourceType) => void;
  hasVideoUploaded?: boolean;
  hasImagesUploaded?: boolean;
  onValidationChange?: (message: string | null) => void;
  onFileUpload?: (type: 'video' | 'images') => void;
  className?: string;
}

export const SourceSelector = ({
  value,
  onChange,
  hasVideoUploaded = false,
  hasImagesUploaded = false,
  onValidationChange,
  onFileUpload,
  className,
}: SourceSelectorProps) => {
  const options = [
    {
      value: THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES,
      label: "Video frames",
      description: "We'll automatically pick the most expressive frames from your video",
    },
    {
      value: THUMBNAIL_SOURCE_TYPES.IMAGES,
      label: "Uploaded images",
      description: "Use images you've uploaded",
    },
  ];

  const getValidationMessage = () => {
    if (value === THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES && !hasVideoUploaded) {
      return "Upload a video first to use video frames";
    }
    if (value === THUMBNAIL_SOURCE_TYPES.IMAGES && !hasImagesUploaded) {
      return "Upload at least one image first";
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  useEffect(() => {
    onValidationChange?.(validationMessage);
  }, [validationMessage, onValidationChange]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">
          Thumbnail source
        </label>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => {
            const isDisabled = false; // Allow switching between options even if assets aren't available
            const isSelected = value === option.value;
            const needsAssets = (option.value === THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES && !hasVideoUploaded) ||
              (option.value === THUMBNAIL_SOURCE_TYPES.IMAGES && !hasImagesUploaded);

            return (
              <button
                key={option.value}
                type="button"
                disabled={isDisabled}
                onClick={() => onChange(option.value)}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-slate-600 bg-slate-50 shadow-sm"
                    : needsAssets
                      ? "border-amber-300 bg-amber-50/50 hover:border-amber-400 hover:bg-amber-50/70 cursor-pointer"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-25 cursor-pointer"
                )}
              >
                {/* Radio indicator */}
                <div className={cn(
                  "absolute top-3 right-3 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                  isSelected
                    ? "border-slate-600 bg-slate-600"
                    : "border-slate-300"
                )}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                <span className={cn(
                  "text-sm font-semibold",
                  needsAssets ? "text-amber-700" : "text-slate-900"
                )}>
                  {option.label}
                </span>
                <span className={cn(
                  "text-xs mt-1 leading-relaxed",
                  needsAssets ? "text-amber-600" : "text-slate-600"
                )}>
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* File upload button */}
        {onFileUpload && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onFileUpload('video')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Video
            </button>
            <button
              type="button"
              onClick={() => onFileUpload('images')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Images
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
