import { useState } from "react";
import { Input } from "@/components/atoms/Input";
import { InlineAlert } from "@/components/atoms/InlineAlert";
import { HOOK_TONES, VALIDATION_RULES } from "@/constants/video";
import type { HookTone, InlineAlert as InlineAlertType } from "@/lib/types/thumbnails";

export interface HookTextControlsProps {
    hookText: string;
    onHookTextChange: (value: string) => void;
    tone: HookTone;
    onToneChange: (value: HookTone) => void;
    inlineAlert?: InlineAlertType | null;
    onAlertDismiss?: () => void;
    className?: string;
}

export const HookTextControls = ({
    hookText,
    onHookTextChange,
    tone,
    onToneChange,
    inlineAlert,
    onAlertDismiss,
    className,
}: HookTextControlsProps) => {
    const [localHookText, setLocalHookText] = useState(hookText);

    const handleHookTextChange = (value: string) => {
        const truncatedValue = value.slice(0, VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH);
        setLocalHookText(truncatedValue);
        onHookTextChange(truncatedValue);
    };

    const handleToneChange = (newTone: HookTone) => {
        onToneChange(newTone);
    };

    const toneOptions = [
        { value: HOOK_TONES.VIRAL, label: "Viral", description: "Attention-grabbing and shareable" },
        { value: HOOK_TONES.CURIOSITY, label: "Curiosity", description: "Spark interest and questions" },
        { value: HOOK_TONES.EDUCATIONAL, label: "Educational", description: "Informative and helpful" },
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
                        placeholder="Enter your hook text..."
                        value={localHookText}
                        onChange={(e) => handleHookTextChange(e.target.value)}
                        maxLength={VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH}
                    />
                    <p className="text-xs text-slate-500">
                        {localHookText.length}/{VALIDATION_RULES.HOOK_TEXT_MAX_LENGTH} characters
                    </p>
                </div>

                {/* Tone Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        Tone
                    </label>
                    <div className="flex gap-2">
                        {toneOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleToneChange(option.value)}
                                className={`flex-1 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 ${tone === option.value
                                        ? "border-slate-500 bg-slate-50"
                                        : "border-slate-200"
                                    }`}
                            >
                                <div className="font-medium text-slate-900">{option.label}</div>
                                <div className="text-xs text-slate-500 mt-1">{option.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inline Alert */}
                {inlineAlert && inlineAlert.scope === 'controls' && (
                    <InlineAlert
                        scope={inlineAlert.scope}
                        kind={inlineAlert.kind}
                        message={inlineAlert.message}
                    />
                )}
            </div>
        </div>
    );
};
