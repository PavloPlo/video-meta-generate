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
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Thumbnail source
        </label>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-start rounded-lg border p-3 text-left transition-colors",
                "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
                value === option.value
                  ? "border-slate-500 bg-slate-50"
                  : "border-slate-200"
              )}
            >
              <span className="text-sm font-medium text-slate-900">
                {option.label}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {validationMessage && (
        <p className="text-xs text-amber-600" role="alert">
          {validationMessage}
        </p>
      )}
    </div>
  );
};
