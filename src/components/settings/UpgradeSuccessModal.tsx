/**
 * UpgradeSuccessModal
 *
 * Modal shown after a successful subscription upgrade.
 * Displays the new plan benefits and renewal date.
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Crown, Zap, Sparkles, Check, PartyPopper } from "lucide-react";
import type { PlanTier } from "../../hooks/useSubscription";

interface UpgradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanTier;
  planName: string;
  currentPeriodEnd: number | null;
}

const PLAN_BENEFITS: Record<string, string[]> = {
  plus: [
    "Generación ilimitada de planes diarios con IA",
    "Acceso a Gemini 2.5 Flash Lite",
    "Acceso a Gemini 3 Flash",
    "Soporte prioritario por email",
  ],
  pro: [
    "Generación ilimitada de planes diarios con IA",
    "Todos los modelos de IA disponibles",
    "Gemini 3 Flash (Dynamic Thinking)",
    "Groq GPT OSS 20B & 120B",
    "Acceso a API (próximamente)",
    "Soporte prioritario premium",
  ],
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  plus: <Zap className="w-8 h-8" />,
  pro: <Crown className="w-8 h-8" />,
};

export function UpgradeSuccessModal({
  isOpen,
  onClose,
  plan,
  planName,
  currentPeriodEnd,
}: UpgradeSuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti animation on open
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const benefits = PLAN_BENEFITS[plan] || [];
  const icon = PLAN_ICONS[plan] || <Sparkles className="w-8 h-8" />;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-2 border-primary/30 overflow-hidden">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="confetti-container">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <div className="text-primary">{icon}</div>
          </div>

          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <PartyPopper className="w-6 h-6 text-yellow-500" />
            ¡Felicidades!
            <PartyPopper className="w-6 h-6 text-yellow-500" />
          </DialogTitle>

          <DialogDescription className="text-base text-muted-foreground">
            Has actualizado a{" "}
            <span className="font-semibold text-foreground">{planName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Benefits list */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Tu plan incluye:
            </h4>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Renewal date */}
          {currentPeriodEnd && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Renovación:</span>{" "}
                {formatDate(currentPeriodEnd)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tu suscripción se renovará automáticamente. Puedes cancelar en
                cualquier momento desde la configuración.
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          ¡Empezar a usar {planName}!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
