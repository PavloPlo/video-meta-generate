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
      {/* Selection Radio Button */}
      <input
        type="radio"
        name="thumbnail-variant"
        checked={isSelected}
        onChange={onSelect}
        className="absolute top-3 left-3 z-10 w-4 h-4 text-slate-600 focus:ring-slate-500 focus:ring-offset-0"
        aria-label={`Select thumbnail variant ${variant.id}`}
      />

      {/* Image Container */}
      <div
        className={cn(
          "relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
          isSelected
            ? "border-slate-500 ring-2 ring-slate-500/20"
            : "border-slate-200 hover:border-slate-300"
        )}
        onClick={onSelect}
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
      </div>

      {/* Readability Badge */}
      <div className="absolute top-3 right-3">
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
            readabilityStyles[readability]
          )}
        >
          {readabilityLabels[readability]}
        </span>
      </div>
    </div>
  );
};
