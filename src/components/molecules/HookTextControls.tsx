import { useState, useEffect } from "react";
import { Input } from "@/components/atoms/Input";
import { InlineAlert } from "@/components/atoms/InlineAlert";
import { ToneSelector } from "@/components/atoms/ToneSelector";
import { VALIDATION_RULES } from "@/constants/video";
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
                        <p className={`text-xs transition-colors ${
                            localHookText.length > VALIDATION_RULES.HOOK_TEXT_RECOMMENDED_LENGTH
                                ? "text-amber-600"
                                : "text-slate-500"
                        }`}>
                            Recommended: under {VALIDATION_RULES.HOOK_TEXT_RECOMMENDED_LENGTH} characters
                        </p>
                        <p className={`text-xs tabular-nums transition-colors ${
                            localHookText.length > VALIDATION_RULES.HOOK_TEXT_RECOMMENDED_LENGTH
                                ? "text-amber-600 font-medium"
                                : "text-slate-500"
                        }`}>
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
                        <ToneSelector
                            value={tone}
                            onChange={handleToneChange}
                            showHelperText={true}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};
