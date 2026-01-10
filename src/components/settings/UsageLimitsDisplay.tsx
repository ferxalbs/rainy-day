/**
 * UsageLimitsDisplay Component
 *
 * Displays the user's daily AI usage limits with progress bar.
 */

import { useSubscription } from "../../hooks/useSubscription";
import { Button } from "../ui/button";

interface UsageLimitsDisplayProps {
  onUpgradeClick?: () => void;
}

export function UsageLimitsDisplay({
  onUpgradeClick,
}: UsageLimitsDisplayProps) {
  const { limits, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-2 bg-muted rounded w-full"></div>
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

  const { planGeneration } = limits;
  const isUnlimited = planGeneration.limit === -1;
  const limit = planGeneration.limit;
  const percentConsumed = isUnlimited
    ? 0
    : limit === 0
    ? 100
    : Math.min(100, Math.max(0, ((limit - planGeneration.remaining) / limit) * 100));

  return (
    <div className="space-y-3">
      {/* Daily AI Plans Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-foreground">Daily AI Plans</span>
          <span className="text-sm text-muted-foreground">
            {isUnlimited
              ? "Unlimited"
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
    </div>
  );
}
