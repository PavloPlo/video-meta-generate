import { useState, useEffect } from "react";
import { Input } from "@/components/atoms/Input";
import { InlineAlert } from "@/components/atoms/InlineAlert";
import { HOOK_TONES, VALIDATION_RULES } from "@/constants/video";
import type { HookTone, InlineAlert as InlineAlertType } from "@/lib/types/thumbnails";

export interface HookTextControlsProps {
    hookText: string;
    onHookTextChange: (value: string) => void;
    tone?: HookTone;
    onToneChange?: (value: HookTone) => void;
    showToneSelector?: boolean;
    className?: string;
}

export const HookTextControls = ({
    hookText,
    onHookTextChange,
    tone,
    onToneChange,
    showToneSelector = false,
    className,
}: HookTextControlsProps) => {
    const [localHookText, setLocalHookText] = useState(hookText);

    // Rotating placeholders
    const placeholders = [
        "This Changed Everything",
        "I Wish I Knew This Earlier",
        "You Won't Believe What Happened",
        "The Secret They Don't Want You To Know"
    ];
    const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000); // Rotate every 3 seconds

        return () => clearInterval(interval);
    }, [placeholders.length]);

    const handleHookTextChange = (value: string) => {
        const truncatedValue = value.slice(0, VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH);
        setLocalHookText(truncatedValue);
        onHookTextChange(truncatedValue);
    };

    const handleToneChange = (newTone: HookTone) => {
        onToneChange?.(newTone);
    };

    const toneOptions = [
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
    ];

    return (
        <div className={className}>
            <div className="space-y-4">
                {/* Hook Text Input */}
                <div className="space-y-2">
                    <label htmlFor="hook-text" className="text-sm font-medium text-slate-700">
                        Hook text
                    </label>
                    <Input
                        id="hook-text"
                        type="text"
                        placeholder={placeholders[currentPlaceholderIndex]}
                        value={localHookText}
                        onChange={(e) => handleHookTextChange(e.target.value)}
                        maxLength={VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH}
                        className="transition-all duration-300"
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500">
                            Recommended: under 6 words
                        </p>
                        <p className="text-xs text-slate-500 tabular-nums">
                            {localHookText.length}/{VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH}
                        </p>
                    </div>
                </div>

                {/* Tone Selector - conditionally rendered */}
                {showToneSelector && tone && onToneChange && (
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">
                            Tone
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {toneOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onToneChange(option.value)}
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
                        <p className="text-xs text-slate-500">
                            Used for text style, not content meaning
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};
