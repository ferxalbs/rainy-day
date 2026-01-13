/**
 * PlanSettings Component
 *
 * Displays current subscription plan, usage limits, and upgrade options.
 */

import { useSubscription } from "../../hooks/useSubscription";
import { useTranslation } from "../../hooks/useTranslation";
import { useLanguage } from "../../contexts/LanguageContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function PlanSettings() {
  const {
    plan,
    planName,
    price,
    selectedModel,
    availableModels,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    isLoading,
    error,
    startCheckout,
    openBillingPortal,
    cancelSubscription,
    reactivateSubscription,
  } = useSubscription();

  const { t } = useTranslation();
  const { language } = useLanguage();

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
    const locale = language === "es" ? "es-ES" : "en-US";
    return new Date(timestamp).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case "free":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "plus":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "pro":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="p-6 rounded-2xl bg-card/30 border-2 border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("billing.currentPlan")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("billing.subscriptionDetails")}
            </p>
          </div>
          <Badge className={getPlanBadgeColor(plan)}>{planName}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("billing.price")}</p>
            <p className="text-lg font-semibold text-foreground">
              {price === 0 ? t("common.free") : `$${price}/month`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("billing.aiModel")}</p>
            <p className="text-lg font-semibold text-foreground">
              {availableModels.find((m) => m.id === selectedModel)?.name ||
                selectedModel}
            </p>
          </div>
        </div>

        {currentPeriodEnd && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {cancelAtPeriodEnd ? t("billing.cancelsOn") : t("billing.renewsOn")}
            </p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(currentPeriodEnd)}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {plan === "free" ? (
            <>
              <Button
                onClick={() => startCheckout("plus")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("billing.upgradeToPlus")}
              </Button>
              <Button
                onClick={() => startCheckout("pro")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {t("billing.upgradeToPro")}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={openBillingPortal} variant="outline">
                {t("billing.manageBilling")}
              </Button>
              {cancelAtPeriodEnd ? (
                <Button
                  onClick={reactivateSubscription}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {t("billing.reactivate")}
                </Button>
              ) : (
                <Button onClick={cancelSubscription} variant="destructive">
                  {t("billing.cancelPlan")}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
