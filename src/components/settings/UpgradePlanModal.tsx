/**
 * UpgradePlanModal
 *
 * Modal for upgrading subscription plans with pricing cards.
 */

import { useState } from "react";
import { useSubscription, type PlanTier } from "../../hooks/useSubscription";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Sparkles,
  Zap,
  Crown,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlanCardProps {
  id: PlanTier;
  name: string;
  price: number;
  features: string[];
  icon: React.ReactNode;
  isCurrent: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  isLoading: boolean;
}

function PlanCard({
  name,
  price,
  features,
  icon,
  isCurrent,
  isPopular,
  onSelect,
  isLoading,
}: PlanCardProps) {
  return (
    <div
      className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 ${
        isPopular
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : isCurrent
          ? "border-green-500/50 bg-green-500/5"
          : "border-border/50 bg-card/30 hover:border-border"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
          Popular
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
          Current Plan
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-xl ${
            isPopular
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{name}</h3>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-bold">${price}</span>
        {price > 0 && <span className="text-muted-foreground">/month</span>}
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onSelect}
        disabled={isCurrent || isLoading}
        variant={isPopular ? "default" : "outline"}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : isCurrent ? (
          "Current Plan"
        ) : price === 0 ? (
          "Downgrade"
        ) : (
          <>
            Upgrade
            <ExternalLink className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}

export function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
  const {
    plan: currentPlan,
    startCheckout,
    openBillingPortal,
    cancelAtPeriodEnd,
  } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null);

  const plans: Array<{
    id: PlanTier;
    name: string;
    price: number;
    features: string[];
    icon: React.ReactNode;
    isPopular?: boolean;
  }> = [
    {
      id: "free",
      name: "Free",
      price: 0,
      icon: <Sparkles className="w-5 h-5" />,
      features: [
        "5 AI plan generations per day",
        "Gemini 2.5 Flash Lite",
        "Email, Calendar & Tasks sync",
        "Basic daily briefings",
      ],
    },
    {
      id: "plus",
      name: "Plus",
      price: 4,
      icon: <Zap className="w-5 h-5" />,
      isPopular: true,
      features: [
        "Unlimited AI plan generations",
        "Gemini 2.5 Flash Lite",
        "Gemini 3 Flash",
        "Priority email support",
        "All Free features",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 8,
      icon: <Crown className="w-5 h-5" />,
      features: [
        "Unlimited AI plan generations",
        "All Plus models",
        "Gemini 3 Flash (Dynamic Thinking)",
        "Groq GPT OSS 20B & 120B",
        "API access (coming soon)",
      ],
    },
  ];

  const handleSelectPlan = async (planId: PlanTier) => {
    if (planId === currentPlan) return;

    if (planId === "free") {
      // Handle downgrade - open portal
      await openBillingPortal();
      return;
    }

    setLoadingPlan(planId);
    try {
      await startCheckout(planId as "plus" | "pro");
      onClose();
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-2 border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your productivity needs.
          </DialogDescription>
        </DialogHeader>

        {cancelAtPeriodEnd && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Your subscription is set to cancel at the end of the billing
              period.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {plans.map((planConfig) => (
            <PlanCard
              key={planConfig.id}
              {...planConfig}
              isCurrent={currentPlan === planConfig.id}
              onSelect={() => handleSelectPlan(planConfig.id)}
              isLoading={loadingPlan === planConfig.id}
            />
          ))}
        </div>

        {currentPlan !== "free" && (
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={openBillingPortal}
              className="text-muted-foreground"
            >
              Manage billing & invoices
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
