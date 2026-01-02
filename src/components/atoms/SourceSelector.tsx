import { cn } from "@/lib/utils";
import { THUMBNAIL_SOURCE_TYPES } from "@/constants/video";
import type { SourceType } from "@/lib/types/thumbnails";

export interface SourceSelectorProps {
  value: SourceType;
  onChange: (value: SourceType) => void;
  hasVideoUploaded?: boolean;
  hasImagesUploaded?: boolean;
  className?: string;
}

export const SourceSelector = ({
  value,
  onChange,
  hasVideoUploaded = false,
  hasImagesUploaded = false,
  className,
}: SourceSelectorProps) => {
  const options = [
    {
      value: THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES,
      label: "Video frames",
      description: "Use frames extracted from your video",
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

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">
          Thumbnail source
        </label>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => {
            const isDisabled = (option.value === THUMBNAIL_SOURCE_TYPES.VIDEO_FRAMES && !hasVideoUploaded) ||
              (option.value === THUMBNAIL_SOURCE_TYPES.IMAGES && !hasImagesUploaded);
            const isSelected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onChange(option.value)}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-slate-600 bg-slate-50 shadow-sm"
                    : isDisabled
                      ? "border-slate-200 bg-slate-50/50 cursor-not-allowed opacity-60"
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
                  isDisabled ? "text-slate-400" : "text-slate-900"
                )}>
                  {option.label}
                </span>
                <span className={cn(
                  "text-xs mt-1 leading-relaxed",
                  isDisabled ? "text-slate-400" : "text-slate-600"
                )}>
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Helper text */}
        <p className="text-xs text-slate-500">
          We&apos;ll automatically pick the most expressive frames
        </p>
      </div>

      {validationMessage && (
        <p className="text-xs text-amber-600" role="alert">
          {validationMessage}
        </p>
      )}
    </div>
  );
};
