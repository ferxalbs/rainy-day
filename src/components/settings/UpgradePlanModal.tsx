/**
 * UpgradePlanModal
 *
 * Modal for upgrading subscription plans with pricing cards.
 * Refined for elegance, responsiveness, and premium aesthetics.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Check,
  Crown,
  ExternalLink,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useSubscription, PlanTier } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";

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
  description: string;
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
  description,
  isCurrent,
  isPopular,
  onSelect,
  isLoading,
}: PlanCardProps) {
  return (
    <div
      className={`relative flex flex-col h-full rounded-3xl border transition-all duration-300 ${
        isPopular
          ? "border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10 z-10 scale-[1.02]"
          : "border-border/40 bg-card/20 hover:bg-card/40 hover:border-primary/20"
      } ${
        isCurrent
          ? "border-green-500/50 bg-green-500/5 hover:bg-green-500/10"
          : ""
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <Badge className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary text-primary-foreground border-none rounded-full shadow-lg shadow-primary/20 whitespace-nowrap">
            Most Popular
          </Badge>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <Badge
            variant="secondary"
            className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-500 hover:bg-green-600 text-white border-none rounded-full shadow-lg shadow-green-500/20 whitespace-nowrap"
          >
            Active Plan
          </Badge>
        </div>
      )}

      <div className="flex-1 p-5 flex flex-col items-center text-center">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${
            isPopular
              ? "bg-primary/20 text-primary"
              : isCurrent
              ? "bg-green-500/20 text-green-500"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </div>

        <h3 className="text-xl font-bold tracking-tight mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-[200px]">
          {description}
        </p>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-extrabold tracking-tight">
            ${price}
          </span>
          <span className="text-muted-foreground text-sm font-medium">/mo</span>
        </div>

        <ul className="space-y-2.5 w-full text-left mb-6 flex-1 px-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  isCurrent
                    ? "text-green-500"
                    : isPopular
                    ? "text-primary"
                    : "text-primary/60"
                }`}
              />
              <span className="text-sm text-muted-foreground leading-tight font-medium">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="w-full mt-auto">
          <Button
            onClick={onSelect}
            disabled={isCurrent || isLoading}
            variant={isPopular ? "default" : "outline"}
            size="lg"
            className={`w-full font-bold h-10 text-sm rounded-xl transition-all duration-300 ${
              isPopular
                ? "shadow-md shadow-primary/20 hover:shadow-primary/30 text-white hover:scale-[1.02]"
                : "hover:bg-primary/5 hover:text-primary hover:border-primary/20"
            }`}
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
                Get Started
                <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
              </>
            )}
          </Button>
          {!isCurrent && price !== 0 && (
            <p className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
              14-day money-back guarantee
            </p>
          )}
        </div>
      </div>
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
    description: string;
    features: string[];
    icon: React.ReactNode;
    isPopular?: boolean;
  }> = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Essentials for getting started with AI.",
      icon: <Sparkles className="w-6 h-6" />,
      features: [
        "5 AI plan generations / day",
        "Gemini 2.5 Flash Lite access",
        "Basic Calendar & Tasks Sync",
        "Community Support",
      ],
    },
    {
      id: "plus",
      name: "Plus",
      price: 4,
      description: "Supercharged AI for daily productivity.",
      icon: <Zap className="w-6 h-6" />,
      isPopular: true,
      features: [
        "Everything in Free",
        "Unlimited AI generations",
        "Priority Gemini 3 Flash",
        "Advanced Task Prioritization",
        "Priority Support",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 8,
      description: "Maximum power for power power users.",
      icon: <Crown className="w-6 h-6" />,
      features: [
        "Everything in Plus",
        "Gemini 3 Flash (Thinking)",
        "Groq GPT OSS Powerhouse",
        "Custom Agent Personality",
        "Early Feature Access",
      ],
    },
  ];

  const handleSelectPlan = async (planId: PlanTier) => {
    if (planId === currentPlan) return;

    if (planId === "free") {
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
      <DialogContent className="max-w-[calc(100vw-2rem)] w-full sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl p-0 gap-0 border-none bg-transparent shadow-none [&>button]:hidden h-auto max-h-[85vh] flex flex-col">
        {/* Main Content Container with Glass Effect */}
        <div className="bg-background/80 backdrop-blur-3xl border border-white/10 sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-full">
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen opacity-30 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] mix-blend-screen opacity-20" />
          </div>

          {/* Close Button Override */}
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-8 h-8 bg-black/5 hover:bg-black/10 backdrop-blur-sm border border-white/10"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-70"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>

          <div className="p-6 md:p-1 mt-3 relative flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            <DialogHeader className="mb-6 text-center max-w-2xl mx-auto shrink-0">
              <DialogTitle className="text-2xl md:text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Upgrade Your Workspace
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground/80 leading-relaxed max-w-lg mx-auto">
                Unlock the full potential of your AI assistant. Cancel anytime.
              </DialogDescription>
            </DialogHeader>

            {cancelAtPeriodEnd && (
              <div className="max-w-lg mx-auto mb-6 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-yellow-500">
                      Cancellation Pending
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Ends next billing cycle
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 font-bold h-7 text-xs"
                  onClick={openBillingPortal}
                >
                  Manage
                </Button>
              </div>
            )}

            {/* Grid Layout - Refined */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch pt-2 pb-2 flex-1 max-w-5xl mx-auto w-full">
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
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-muted/20 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold shadow-sm"
                  >
                    U{i}
                  </div>
                ))}
              </div>
              <span className="ml-2 font-medium">Join 10,000+ happy users</span>
            </div>

            {currentPlan !== "free" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={openBillingPortal}
                className="text-muted-foreground hover:text-primary font-medium gap-2 text-xs"
              >
                Billing & Invoices
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
