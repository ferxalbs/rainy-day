import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GoogleSignIn } from "./components/auth/GoogleSignIn";
import { MainLayout } from "./components/layout/MainLayout";
import { CommandPalette } from "./components/CommandPalette";
import { UpdateModal } from "./components/update";
import { UpgradeSuccessModal } from "./components/settings/UpgradeSuccessModal";
import { useNativeNotifications } from "./hooks/useNativeNotifications";
import { useDeepLinks } from "./hooks/useDeepLinks";
import { useSubscription } from "./hooks/useSubscription";
import { checkForUpdate } from "./services/update";
import "./App.css";

// Global event for opening update modal
export const OPEN_UPDATE_MODAL_EVENT = "open-update-modal";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpgradeSuccessModal, setShowUpgradeSuccessModal] = useState(false);

  const {
    plan,
    planName,
    currentPeriodEnd,
    pollForPlanUpdate,
    refresh: refreshPlan,
  } = useSubscription();

  // Initialize native notifications when authenticated
  useNativeNotifications({
    enabled: isAuthenticated,
  });

  // Handle billing deep links
  const handleBillingSuccess = useCallback(async () => {
    console.log("[App] Billing success deep link received");

    // Poll for plan update from webhook
    const updated = await pollForPlanUpdate();

    if (updated) {
      // Show success modal
      setShowUpgradeSuccessModal(true);
    } else {
      // Still refresh to get latest state
      await refreshPlan();
    }
  }, [pollForPlanUpdate, refreshPlan]);

  const handleBillingCancel = useCallback(() => {
    console.log("[App] Billing cancelled");
    // User cancelled, no action needed
  }, []);

  // Initialize deep link handling
  useDeepLinks({
    onBillingSuccess: handleBillingSuccess,
    onBillingCancel: handleBillingCancel,
  });

  // Listen for update modal open event (from Command Palette)
  useEffect(() => {
    const handleOpenUpdate = () => setShowUpdateModal(true);
    window.addEventListener(OPEN_UPDATE_MODAL_EVENT, handleOpenUpdate);
    return () =>
      window.removeEventListener(OPEN_UPDATE_MODAL_EVENT, handleOpenUpdate);
  }, []);

  // Auto-check for updates on startup (silently, only show if update available)
  useEffect(() => {
    if (!isAuthenticated) return;

    const autoCheck = async () => {
      try {
        const update = await checkForUpdate();
        if (update) {
          // Show modal if update is available
          setShowUpdateModal(true);
        }
      } catch (error) {
        // Silently fail on auto-check
        console.log("[Update] Auto-check failed:", error);
      }
    };

    // Check after 5 seconds to not block app startup
    const timer = setTimeout(autoCheck, 5000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleCloseUpdateModal = useCallback(() => {
    setShowUpdateModal(false);
  }, []);

  const handleCloseUpgradeSuccessModal = useCallback(() => {
    setShowUpgradeSuccessModal(false);
  }, []);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <GoogleSignIn />;
  }

  return (
    <>
      <MainLayout />
      <CommandPalette />
      <UpdateModal isOpen={showUpdateModal} onClose={handleCloseUpdateModal} />
      <UpgradeSuccessModal
        isOpen={showUpgradeSuccessModal}
        onClose={handleCloseUpgradeSuccessModal}
        plan={plan}
        planName={planName}
        currentPeriodEnd={currentPeriodEnd}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
