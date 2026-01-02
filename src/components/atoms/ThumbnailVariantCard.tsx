import { cn } from "@/lib/utils";
import { READABILITY_LEVELS } from "@/constants/video";
import type { ThumbnailVariant, Readability } from "@/lib/types/thumbnails";
import Image from "next/image";

export interface ThumbnailVariantCardProps {
  variant: ThumbnailVariant;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

const readabilityStyles = {
  [READABILITY_LEVELS.GOOD]: "bg-green-100 text-green-800 border-green-200",
  [READABILITY_LEVELS.OK]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [READABILITY_LEVELS.POOR]: "bg-red-100 text-red-800 border-red-200",
  [READABILITY_LEVELS.UNKNOWN]: "bg-slate-100 text-slate-600 border-slate-200",
} as const;

const readabilityLabels = {
  [READABILITY_LEVELS.GOOD]: "Good",
  [READABILITY_LEVELS.OK]: "OK",
  [READABILITY_LEVELS.POOR]: "Poor",
  [READABILITY_LEVELS.UNKNOWN]: "Unknown",
} as const;

export const ThumbnailVariantCard = ({
  variant,
  isSelected,
  onSelect,
  className,
}: ThumbnailVariantCardProps) => {
  const readability = variant.readability || READABILITY_LEVELS.UNKNOWN;

  return (
    <div className={cn("relative group", className)}>
      {/* Image Container */}
      <div
        className={cn(
          "relative aspect-video rounded-lg overflow-hidden border-4 transition-all cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          isSelected
            ? "border-blue-600 ring-4 ring-blue-500/30 shadow-lg"
            : "border-slate-200 hover:border-slate-300"
        )}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Select thumbnail variant ${variant.id}${isSelected ? ' (currently selected)' : ''}`}
      >
        <Image
          src={variant.imageUrl}
          alt={`Thumbnail variant ${variant.id}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay on hover for better UX */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

        {/* Selection Overlay */}
        {isSelected && (
          <>
            {/* Checkmark Overlay */}
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
              <div className="bg-blue-500 rounded-full p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Selected Label */}
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white shadow-md">
                Selected
              </span>
            </div>
          </>
        )}
      </div>

      {/* Readability Badge with Tooltip */}
      <div className="absolute top-3 right-3">
        <div className="relative group/tooltip">
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
              readabilityStyles[readability]
            )}
          >
            {readabilityLabels[readability]}
          </span>

          {/* Tooltip */}
          {readability === READABILITY_LEVELS.POOR && (
            <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
              Text contrast may be hard to read on small screens
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
