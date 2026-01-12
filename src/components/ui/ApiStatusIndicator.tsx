/**
 * API Status Indicator
 *
 * Shows connection status to the backend API with a wifi-like icon.
 * Colors: Green (connected), Yellow (checking), Red (disconnected)
 */

import { useState, useEffect, useCallback } from "react";
import { checkBackendHealth } from "../../services/backend/api";

type ConnectionStatus = "connected" | "checking" | "disconnected";

export function ApiStatusIndicator() {
    const [status, setStatus] = useState<ConnectionStatus>("checking");

    const checkConnection = useCallback(async () => {
        setStatus("checking");
        try {
            const isHealthy = await checkBackendHealth();
            setStatus(isHealthy ? "connected" : "disconnected");
        } catch {
            setStatus("disconnected");
        }
    }, []);

    useEffect(() => {
        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, [checkConnection]);

    const statusConfig = {
        connected: {
            color: "text-green-500",
            bgColor: "bg-green-500/20",
            label: "Cloud sync available",
        },
        checking: {
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/20",
            label: "Checking connection...",
        },
        disconnected: {
            color: "text-red-500",
            bgColor: "bg-red-500/20",
            label: "Cloud sync unavailable",
        },
    };

    const config = statusConfig[status];

    return (
        <div className="relative group" title={config.label}>
            <div
                className={`p-1.5 rounded-full ${config.bgColor} transition-colors duration-300`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${config.color} transition-colors duration-300 ${status === "checking" ? "animate-pulse" : ""}`}
                >
                    <path d="M12 20h.01" />
                    <path d="M2 8.82a15 15 0 0 1 20 0" />
                    <path d="M5 12.859a10 10 0 0 1 14 0" />
                    <path d="M8.5 16.429a5 5 0 0 1 7 0" />
                </svg>
            </div>

            {/* Tooltip - only shows status, no sensitive info */}
            <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap text-xs">
                {config.label}
            </div>
        </div>
    );
}
