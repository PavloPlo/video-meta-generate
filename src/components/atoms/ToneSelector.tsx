"use client";

import { TONE_OPTIONS } from "@/constants/video";
import type { HookTone } from "@/lib/types/thumbnails";
import { cn } from "@/lib/utils";

export interface ToneSelectorProps {
  value: HookTone;
  onChange: (value: HookTone) => void;
  className?: string;
  showHelperText?: boolean;
}

export const ToneSelector = ({
  value,
  onChange,
  className,
  showHelperText = false,
}: ToneSelectorProps) => {
  return (
    <div className={className}>
      <fieldset className="space-y-3">
        <legend className="sr-only">Tone selection, 3 options</legend>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Tone">
          {TONE_OPTIONS.map((option) => {
            const isSelected = value === option.value;
            const inputId = `tone-${option.value}`;

            return (
              <label
                key={option.value}
                htmlFor={inputId}
                className={cn(
                  "relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all duration-200 cursor-pointer",
                  "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
                  isSelected
                    ? "border-slate-800 bg-slate-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
                )}
              >
                <input
                  type="radio"
                  id={inputId}
                  name="tone"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value as HookTone)}
                  className="sr-only"
                  aria-label={`${option.label}: ${option.description}`}
                />
                
                {/* Check icon indicator for selected state */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                    <svg 
                      className="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                )}

                <div className={cn("text-2xl mb-2", option.color)} aria-hidden="true">
                  {option.icon}
                </div>
                <div className={cn(
                  "font-semibold text-sm transition-colors",
                  isSelected ? "text-slate-900" : "text-slate-700"
                )}>
                  {option.label}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-tight">
                  {option.description}
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
      {showHelperText && (
        <p className="text-xs text-slate-500 mt-3">
          Used for text style, not content meaning
        </p>
      )}
    </div>
  );
};

