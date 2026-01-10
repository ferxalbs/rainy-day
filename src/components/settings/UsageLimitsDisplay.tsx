/**
 * UsageLimitsDisplay Component
 *
 * Displays the user's daily AI usage limits and monthly model usage with progress bars.
 */

import { useSubscription } from "../../hooks/useSubscription";
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";

interface UsageLimitsDisplayProps {
  onUpgradeClick?: () => void;
}

export function UsageLimitsDisplay({
  onUpgradeClick,
}: UsageLimitsDisplayProps) {
  const { limits, isLoading, selectedModel } = useSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-muted rounded w-full"></div>
        <div className="h-8 bg-muted rounded w-full"></div>
      </div>
    );
  }

  if (!limits) {
    return (
      <p className="text-sm text-muted-foreground">
        Usage information unavailable
      </p>
    );
  }

  const { planGeneration, selectedModel: modelUsage } = limits;
  const isUnlimited = planGeneration.limit === -1;
  const limit = planGeneration.limit;
  const used = isUnlimited ? 0 : limit - planGeneration.remaining;
  const percentConsumed = isUnlimited
    ? 0
    : limit === 0
    ? 100
    : Math.min(100, Math.max(0, (used / limit) * 100));

  // Model usage calculation
  const modelHasLimit = modelUsage && modelUsage.limit > 0;
  const modelPercentUsed = modelHasLimit
    ? Math.min(100, (modelUsage.used / modelUsage.limit) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Daily AI Plans Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-foreground">Daily AI Plans</span>
          <span className="text-sm text-muted-foreground">
            {isUnlimited
              ? "Unlimited ✓"
              : `${planGeneration.remaining}/${planGeneration.limit} remaining`}
          </span>
        </div>
        {!isUnlimited && (
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                percentConsumed > 80
                  ? "bg-red-500"
                  : percentConsumed > 50
                  ? "bg-orange-500"
                  : "bg-primary"
              }`}
              style={{ width: `${percentConsumed}%` }}
            />
          </div>
        )}
      </div>

      {/* Selected Model Usage (only show for premium models with limits) */}
      {modelUsage && modelUsage.isPremium && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="text-sm text-foreground">
                {selectedModel || modelUsage.modelId} (Monthly)
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {modelUsage.used}/{modelUsage.limit} used
            </span>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                modelPercentUsed > 80
                  ? "bg-red-500"
                  : modelPercentUsed > 50
                  ? "bg-amber-500"
                  : "bg-amber-400"
              }`}
              style={{ width: `${modelPercentUsed}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Resets on{" "}
            {new Date(modelUsage.resetsAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Limit Reached Warning */}
      {!planGeneration.allowed && (
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <p className="text-sm text-orange-600 mb-2">
            You've reached your daily limit.
          </p>
          {onUpgradeClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={onUpgradeClick}
              className="text-xs border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
            >
              Upgrade for unlimited
            </Button>
          )}
        </div>
      )}

      {/* Model Limit Reached Warning */}
      {modelUsage && modelUsage.isPremium && !modelUsage.allowed && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-600">
            Monthly limit for this model reached. Using default model instead.
          </p>
        </div>
      )}
    </div>
  );
}
