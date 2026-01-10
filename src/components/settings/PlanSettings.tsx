/**
 * PlanSettings Component
 * 
 * Displays current subscription plan, usage limits, and upgrade options.
 */

import { useSubscription } from '../../hooks/useSubscription';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface PlanFeature {
  name: string;
  free: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
}

const PLAN_FEATURES: PlanFeature[] = [
  {
    name: 'Daily AI Plans',
    free: '5 per day',
    plus: 'Unlimited',
    pro: 'Unlimited',
  },
  {
    name: 'AI Models',
    free: 'Gemini 2.5 Flash Lite',
    plus: 'Gemini 2.5 & 3 Flash',
    pro: 'All Models + GPT',
  },
  {
    name: 'Priority Support',
    free: false,
    plus: true,
    pro: true,
  },
  {
    name: 'Advanced Analytics',
    free: false,
    plus: false,
    pro: true,
  },
];

export function PlanSettings() {
  const {
    plan,
    planName,
    price,
    selectedModel,
    availableModels,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    limits,
    isLoading,
    error,
    setModel,
    startCheckout,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'plus': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pro': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="p-6 rounded-2xl bg-card/30 border-2 border-border/30 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Current Plan</h3>
            <p className="text-sm text-muted-foreground">Your subscription details</p>
          </div>
          <Badge className={getPlanBadgeColor(plan)}>
            {planName}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-lg font-semibold text-foreground">
              {price === 0 ? 'Free' : `$${price}/month`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">AI Model</p>
            <p className="text-lg font-semibold text-foreground">
              {availableModels.find(m => m.id === selectedModel)?.name || selectedModel}
            </p>
          </div>
        </div>

        {currentPeriodEnd && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}
            </p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(currentPeriodEnd)}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {plan === 'free' ? (
            <>
              <Button 
                onClick={() => startCheckout('plus')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upgrade to Plus
              </Button>
              <Button 
                onClick={() => startCheckout('pro')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Upgrade to Pro
              </Button>
            </>
          ) : (
            <>
              <Button onClick={openBillingPortal} variant="outline">
                Manage Billing
              </Button>
              {cancelAtPeriodEnd ? (
                <Button onClick={reactivateSubscription} className="bg-green-600 hover:bg-green-700 text-white">
                  Reactivate
                </Button>
              ) : (
                <Button onClick={cancelSubscription} variant="destructive">
                  Cancel Plan
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Usage Limits Card */}
      {limits && (
        <div className="p-6 rounded-2xl bg-card/30 border-2 border-border/30 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">Usage & Limits</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">Daily AI Plans</span>
                <span className="text-sm text-muted-foreground">
                  {limits.planGeneration.limit === -1 
                    ? 'Unlimited' 
                    : `${limits.planGeneration.remaining}/${limits.planGeneration.limit} remaining`
                  }
                </span>
              </div>
              {limits.planGeneration.limit !== -1 && (
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(limits.planGeneration.remaining / limits.planGeneration.limit) * 100}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {!limits.planGeneration.allowed && (
            <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-600">
                You've reached your daily limit. Upgrade for unlimited AI plans.
              </p>
            </div>
          )}
        </div>
      )}

      {/* AI Model Selection */}
      {availableModels.length > 1 && (
        <div className="p-6 rounded-2xl bg-card/30 border-2 border-border/30 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-foreground mb-4">AI Model</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Choose which AI model to use for generating your daily plans
          </p>
          
          <div className="space-y-2">
            {availableModels.map((model) => (
              <label key={model.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={selectedModel === model.id}
                  onChange={() => setModel(model.id)}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                />
                <span className="text-sm font-medium text-foreground">{model.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Plan Comparison */}
      <div className="p-6 rounded-2xl bg-card/30 border-2 border-border/30 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">Plan Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 text-foreground">Feature</th>
                <th className="text-center py-2 text-foreground">Free</th>
                <th className="text-center py-2 text-foreground">Plus</th>
                <th className="text-center py-2 text-foreground">Pro</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((feature, index) => (
                <tr key={index} className="border-b border-border/10">
                  <td className="py-3 text-foreground font-medium">{feature.name}</td>
                  <td className="py-3 text-center text-muted-foreground">
                    {typeof feature.free === 'boolean' 
                      ? (feature.free ? '✓' : '✗')
                      : feature.free
                    }
                  </td>
                  <td className="py-3 text-center text-muted-foreground">
                    {typeof feature.plus === 'boolean' 
                      ? (feature.plus ? '✓' : '✗')
                      : feature.plus
                    }
                  </td>
                  <td className="py-3 text-center text-muted-foreground">
                    {typeof feature.pro === 'boolean' 
                      ? (feature.pro ? '✓' : '✗')
                      : feature.pro
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}