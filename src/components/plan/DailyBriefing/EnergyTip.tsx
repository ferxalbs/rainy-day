/**
 * EnergyTip Component
 *
 * Displays AI-generated energy tip or recommendation.
 */

import { LightbulbIcon } from "./icons";

interface EnergyTipProps {
    tip: string;
}

export function EnergyTip({ tip }: EnergyTipProps) {
    return (
        <div className="p-4 rounded-xl backdrop-blur-xl border-2 border-border/30 bg-card/20 flex items-start gap-3">
            <LightbulbIcon className="text-primary mt-0.5" />
            <p className="text-sm text-foreground/80 leading-relaxed">{tip}</p>
        </div>
    );
}

export default EnergyTip;
