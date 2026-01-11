/**
 * ModelSelector
 *
 * Dropdown to select AI model based on user's plan.
 * Models are synced with the backend models registry.
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
import { Lock, Loader2, Sparkles, Zap } from "lucide-react";

// All models with their plan requirements
// This should match the MODEL_REGISTRY in server/src/services/ai/models.ts
const ALL_MODELS = [
  // Gemini 2.5 Series
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    tier: "free",
    description: "Fast, efficient",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tier: "plus",
    description: "Balanced, dynamic",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tier: "pro",
    description: "Most capable 2.5",
    monthlyLimit: 10,
  },

  // Gemini 3 Series
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    tier: "plus",
    description: "Deep reasoning",
    badge: "NEW",
  },
  {
    id: "gemini-3-flash-minimal",
    name: "Gemini 3 Flash (Minimal)",
    tier: "plus",
    description: "Fastest 3.0",
  },
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    tier: "pro",
    description: "Maximum intelligence",
    badge: "NEW",
    monthlyLimit: 10,
  },

  // Groq Fast Models
  {
    id: "groq-llama-3.3-70b",
    name: "Llama 3.3 70B (Groq)",
    tier: "pro",
    description: "Ultra-fast",
    monthlyLimit: 20,
  },
  {
    id: "groq-llama-3.1-8b",
    name: "Llama 3.1 8B (Groq)",
    tier: "plus",
    description: "Lightning-fast",
  },

  // GPT-OSS Reasoning (via Groq)
  {
    id: "groq-gpt-oss-20b",
    name: "GPT-OSS 20B",
    tier: "plus",
    description: "Fast reasoning (1000 T/s)",
    badge: "⚡",
  },
  {
    id: "groq-gpt-oss-120b",
    name: "GPT-OSS 120B",
    tier: "pro",
    description: "Deep reasoning (500 T/s)",
    badge: "🧠",
    monthlyLimit: 15,
  },
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
      <SelectTrigger className="w-full">
        {updating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Updating...</span>
          </div>
        ) : (
          <SelectValue placeholder="Select a model">
            <div className="flex items-center gap-2">
              {currentModel?.name || "Select a model"}
              {currentModel &&
                "badge" in currentModel &&
                currentModel.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                    {currentModel.badge}
                  </span>
                )}
            </div>
          </SelectValue>
        )}
      </SelectTrigger>
      <SelectContent>
        {/* Gemini 3 Section */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Gemini 3 (Latest)
        </div>
        {ALL_MODELS.filter((m) => m.id.startsWith("gemini-3")).map((model) => (
          <ModelItem
            key={model.id}
            model={model}
            currentTierLevel={currentTierLevel}
          />
        ))}

        {/* Gemini 2.5 Section */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-1">
          Gemini 2.5
        </div>
        {ALL_MODELS.filter((m) => m.id.startsWith("gemini-2.5")).map(
          (model) => (
            <ModelItem
              key={model.id}
              model={model}
              currentTierLevel={currentTierLevel}
            />
          )
        )}

        {/* Groq Llama Section */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-1">
          <Zap className="w-3 h-3" />
          Groq (Ultra-Fast)
        </div>
        {ALL_MODELS.filter((m) => m.id.startsWith("groq-llama")).map(
          (model) => (
            <ModelItem
              key={model.id}
              model={model}
              currentTierLevel={currentTierLevel}
            />
          )
        )}

        {/* GPT-OSS Reasoning Section */}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-1">
          <Sparkles className="w-3 h-3" />
          GPT-OSS (Reasoning)
        </div>
        {ALL_MODELS.filter((m) => m.id.startsWith("groq-gpt")).map((model) => (
          <ModelItem
            key={model.id}
            model={model}
            currentTierLevel={currentTierLevel}
          />
        ))}
      </SelectContent>
    </Select>
  );
}

// Separate component for model items
function ModelItem({
  model,
  currentTierLevel,
}: {
  model: (typeof ALL_MODELS)[number];
  currentTierLevel: number;
}) {
  const modelTierLevel = TIER_ORDER[model.tier as keyof typeof TIER_ORDER];
  const isLocked = modelTierLevel > currentTierLevel;
  const hasLimit = "monthlyLimit" in model && model.monthlyLimit;

  return (
    <SelectItem value={model.id} disabled={isLocked}>
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span>{model.name}</span>
            {"badge" in model && model.badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                {model.badge}
              </span>
            )}
            {hasLimit && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                {model.monthlyLimit}/mo
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {model.description}
          </span>
        </div>
        {isLocked && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span className="capitalize">{model.tier}</span>
          </div>
        )}
      </div>
    </SelectItem>
  );
}
