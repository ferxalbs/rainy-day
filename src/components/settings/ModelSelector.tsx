/**
 * ModelSelector
 *
 * Dropdown to select AI model based on user's plan.
 */

import { useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Lock, Loader2 } from "lucide-react";

// All models with their plan requirements
const ALL_MODELS = [
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", tier: "free" },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", tier: "plus" },
  {
    id: "gemini-3-flash-thinking",
    name: "Gemini 3 Flash (Dynamic Thinking)",
    tier: "pro",
  },
  { id: "groq-gpt-oss-20b", name: "GPT OSS 20B (Groq)", tier: "pro" },
  { id: "groq-gpt-oss-120b", name: "GPT OSS 120B (Groq)", tier: "pro" },
] as const;

const TIER_ORDER = { free: 0, plus: 1, pro: 2 };

interface ModelSelectorProps {
  onUpgradeClick?: () => void;
}

export function ModelSelector({ onUpgradeClick }: ModelSelectorProps) {
  const { plan, selectedModel, availableModels, setModel, isLoading } =
    useSubscription();
  const [updating, setUpdating] = useState(false);

  const currentTierLevel = TIER_ORDER[plan];

  const handleValueChange = async (modelId: string) => {
    if (modelId === selectedModel) return;

    const isAvailable = availableModels.some((m) => m.id === modelId);
    if (!isAvailable) {
      onUpgradeClick?.();
      return;
    }

    setUpdating(true);
    try {
      await setModel(modelId);
    } catch (error) {
      console.error("Error selecting model:", error);
    } finally {
      setUpdating(false);
    }
  };

  const currentModel = ALL_MODELS.find((m) => m.id === selectedModel);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading models...</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedModel}
      onValueChange={handleValueChange}
      disabled={updating}
    >
      <SelectTrigger className="w-full border-primary/50 focus:border-primary focus:ring-primary/20">
        {updating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating...</span>
          </div>
        ) : (
          <SelectValue placeholder="Select a model">
            {currentModel?.name || "Select a model"}
          </SelectValue>
        )}
      </SelectTrigger>
      <SelectContent>
        {ALL_MODELS.map((model) => {
          const modelTierLevel =
            TIER_ORDER[model.tier as keyof typeof TIER_ORDER];
          const isLocked = modelTierLevel > currentTierLevel;

          return (
            <SelectItem key={model.id} value={model.id} disabled={isLocked}>
              <div className="flex items-center justify-between w-full gap-4">
                <span>{model.name}</span>
                {isLocked && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span className="capitalize">{model.tier}</span>
                  </div>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
