/**
 * useDeepLinks Hook
 *
 * Handles deep link events for billing callbacks from Stripe.
 * Listens for rainyday:// protocol URLs.
 */

import { useEffect, useCallback, useRef } from "react";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";

export type DeepLinkEvent =
  | { type: "billing_success"; sessionId?: string }
  | { type: "billing_cancel" }
  | { type: "settings" }
  | { type: "unknown"; url: string };

interface UseDeepLinksOptions {
  onBillingSuccess?: (sessionId?: string) => void;
  onBillingCancel?: () => void;
}

export function useDeepLinks(options: UseDeepLinksOptions = {}) {
  const { onBillingSuccess, onBillingCancel } = options;
  const callbacksRef = useRef({ onBillingSuccess, onBillingCancel });

  // Keep refs updated
  useEffect(() => {
    callbacksRef.current = { onBillingSuccess, onBillingCancel };
  }, [onBillingSuccess, onBillingCancel]);

  // Parse deep link URL
  const parseDeepLink = useCallback((urlString: string): DeepLinkEvent => {
    try {
      // Handle rainyday:// URLs
      // Format: rainyday://billing/success?session_id=xxx
      const cleanUrl = urlString.replace("rainyday://", "https://app/");
      const url = new URL(cleanUrl);
      const path = url.pathname.replace(/^\//, "");

      if (path.startsWith("billing/success")) {
        const sessionId = url.searchParams.get("session_id") || undefined;
        return { type: "billing_success", sessionId };
      }

      if (path.startsWith("billing/cancel")) {
        return { type: "billing_cancel" };
      }

      if (path === "settings") {
        return { type: "settings" };
      }

      return { type: "unknown", url: urlString };
    } catch (error) {
      console.error("[DeepLinks] Failed to parse URL:", urlString, error);
      return { type: "unknown", url: urlString };
    }
  }, []);

  // Handle deep link event
  const handleDeepLink = useCallback(
    (urls: string[]) => {
      console.log("[DeepLinks] Received URLs:", urls);

      for (const urlString of urls) {
        const event = parseDeepLink(urlString);
        console.log("[DeepLinks] Parsed event:", event);

        switch (event.type) {
          case "billing_success":
            console.log("[DeepLinks] Billing success detected");
            callbacksRef.current.onBillingSuccess?.(event.sessionId);
            break;
          case "billing_cancel":
            console.log("[DeepLinks] Billing cancelled");
            callbacksRef.current.onBillingCancel?.();
            break;
          case "settings":
            // Navigate to settings if needed
            break;
          default:
            console.log("[DeepLinks] Unknown deep link:", urlString);
        }
      }
    },
    [parseDeepLink]
  );

  // Listen for deep link events
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlisten = await onOpenUrl(handleDeepLink);
        console.log("[DeepLinks] Listener registered");
      } catch (error) {
        console.error("[DeepLinks] Failed to register listener:", error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
        console.log("[DeepLinks] Listener unregistered");
      }
    };
  }, [handleDeepLink]);

  return { parseDeepLink };
}
