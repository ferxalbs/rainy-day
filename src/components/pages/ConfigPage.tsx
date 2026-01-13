import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotificationSettings } from "../../hooks/useNotificationSettings";
import { useSubscription } from "../../hooks/useSubscription";
import { useTranslation } from "../../hooks/useTranslation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import {
  User,
  Palette,
  Zap,
  Mail,
  Calendar,
  CheckSquare,
  Shield,
  Info,
  LogOut,
  Rocket,
  Cloud,
  Bell,
  BellOff,
  RefreshCw,
  CreditCard,
  Bot,
  Globe,
} from "lucide-react";
import { Button } from "../ui/button";
import { checkBackendHealth, getBackendInfo } from "../../services/backend/api";
import { getVersion } from "@tauri-apps/api/app";
import { ModelSelector } from "../settings/ModelSelector";
import { UpgradePlanModal } from "../settings/UpgradePlanModal";
import { PlanSettings } from "../settings/PlanSettings";
import { UsageLimitsDisplay } from "../settings/UsageLimitsDisplay";
import { LanguageSelector } from "../settings/LanguageSelector";

// App name constant
const APP_NAME = "Rainy Day";

interface ConfigItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
}

export function ConfigPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const { themeName, currentTheme } = useTheme();
  const { t } = useTranslation();
  const {
    settings: notifSettings,
    isActive: notificationsActive,
    toggle: toggleNotifications,
    setAutoInitialize,
  } = useNotificationSettings();
  const [appVersion, setAppVersion] = useState<string>("...");
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { plan, planName } = useSubscription();

  useEffect(() => {
    // Get app version from Tauri
    getVersion()
      .then(setAppVersion)
      .catch(() => setAppVersion("unknown"));

    // Check backend health and version
    const checkBackend = async () => {
      const healthy = await checkBackendHealth();
      setIsBackendAvailable(healthy);

      if (healthy) {
        const info = await getBackendInfo();
        setBackendVersion(info?.version ?? null);
      }
    };
    checkBackend();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userSection: ConfigItem[] = [
    {
      icon: <User className="w-4 h-4" />,
      label: t("settings.account.name"),
      value: user?.name || t("settings.account.notSignedIn"),
    },
    {
      icon: <Mail className="w-4 h-4" />,
      label: t("settings.account.email"),
      value: user?.email || "—",
    },
  ];

  const appSection: ConfigItem[] = [
    {
      icon: <Info className="w-4 h-4" />,
      label: t("settings.application.appName"),
      value: APP_NAME,
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: t("settings.application.version"),
      value: `v${appVersion}`,
    },
    {
      icon: <Cloud className="w-4 h-4" />,
      label: t("settings.application.backend"),
      value: backendVersion
        ? `v${backendVersion}`
        : isBackendAvailable
          ? t("common.connected")
          : t("common.offline"),
    },
    {
      icon: <Palette className="w-4 h-4" />,
      label: t("settings.application.activeTheme"),
      value: `${themeName} (${currentTheme.mode})`,
    },
  ];

  const capabilities = [
    {
      icon: <Mail className="w-4 h-4" />,
      name: t("settings.capabilities.gmail"),
      status: isAuthenticated ? t("common.active") : t("common.disconnected"),
      isActive: isAuthenticated,
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      name: t("settings.capabilities.calendar"),
      status: isAuthenticated ? t("common.active") : t("common.disconnected"),
      isActive: isAuthenticated,
    },
    {
      icon: <CheckSquare className="w-4 h-4" />,
      name: t("settings.capabilities.googleTasks"),
      status: isAuthenticated ? t("common.active") : t("common.disconnected"),
      isActive: isAuthenticated,
    },
    {
      icon: <Zap className="w-4 h-4" />,
      name: t("settings.capabilities.aiPlans"),
      status: isAuthenticated ? t("common.enabled") : t("common.disconnected"),
      isActive: isAuthenticated,
    },
  ];

  const renderConfigItems = (items: ConfigItem[]) => (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">{item.icon}</div>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* User Info Card */}
      <Card className="border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t("settings.account.title")}
          </CardTitle>
          <CardDescription>{t("settings.account.description")}</CardDescription>
        </CardHeader>
        <CardContent>{renderConfigItems(userSection)}</CardContent>
      </Card>

      {/* App Info Card */}
      <Card className="border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            {t("settings.application.title")}
          </CardTitle>
          <CardDescription>{t("settings.application.description")}</CardDescription>
        </CardHeader>
        <CardContent>{renderConfigItems(appSection)}</CardContent>
      </Card>

      {/* Language Settings Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t("settings.language.title")}
          </CardTitle>
          <CardDescription>{t("settings.language.cardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelector />
        </CardContent>
      </Card>

      {/* Capabilities Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t("settings.capabilities.title")}
          </CardTitle>
          <CardDescription>{t("settings.capabilities.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {capabilities.map((cap, index) => (
              <div key={index}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">{cap.icon}</div>
                    <span className="text-sm text-foreground">{cap.name}</span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${cap.isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {cap.status}
                  </span>
                </div>
                {index < capabilities.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {t("settings.ai.title")}
          </CardTitle>
          <CardDescription>{t("settings.ai.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Model Selector */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">{t("settings.ai.model")}</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {t("settings.ai.modelDescription")}
            </p>
            <ModelSelector onUpgradeClick={() => setShowUpgradeModal(true)} />
          </div>

          <Separator />

          {/* Usage Limits */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              {t("settings.ai.dailyLimits")}
            </h4>
            <UsageLimitsDisplay
              onUpgradeClick={() => setShowUpgradeModal(true)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Billing Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {t("settings.subscription.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.subscription.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanSettings />
        </CardContent>
      </Card>

      {/* Notification Settings Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            {t("settings.notifications.title")}
          </CardTitle>
          <CardDescription>{t("settings.notifications.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {notificationsActive ? (
                <Bell className="w-4 h-4 text-primary" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {t("settings.notifications.enable")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("settings.notifications.enableDescription")}
                </span>
              </div>
            </div>
            <Button
              variant={notificationsActive ? "default" : "outline"}
              size="sm"
              onClick={toggleNotifications}
              className="min-w-[80px]"
            >
              {notificationsActive ? t("common.on") : t("common.off")}
            </Button>
          </div>

          <Separator />

          {/* Auto Initialize Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {t("settings.notifications.autoRequest")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("settings.notifications.autoRequestDescription")}
                </span>
              </div>
            </div>
            <Button
              variant={notifSettings.autoInitialize ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoInitialize(!notifSettings.autoInitialize)}
              className="min-w-[80px]"
            >
              {notifSettings.autoInitialize ? t("common.on") : t("common.off")}
            </Button>
          </div>

          {/* Status */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${notificationsActive ? "bg-green-500" : "bg-muted-foreground"
                  }`}
              />
              <span className="text-xs text-muted-foreground">
                {t("settings.notifications.status")}:{" "}
                <span className="font-medium text-foreground">
                  {notificationsActive
                    ? t("settings.notifications.statusActive")
                    : notifSettings.permissionState === "denied"
                      ? t("settings.notifications.statusDenied")
                      : t("settings.notifications.statusDisabled")}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t("settings.actions.title")}
          </CardTitle>
          <CardDescription>{t("settings.actions.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="group flex items-center gap-3 p-4 rounded-xl border-2 border-border/30 bg-card/20 hover:bg-card/40 hover:border-primary/30 transition-all duration-200 text-left w-full"
            >
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Rocket className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-semibold text-sm text-foreground leading-none">
                  {t("settings.actions.upgradePlan")}
                </span>
                <span className="text-xs text-muted-foreground leading-none">
                  {t("common.current")}: {planName} {plan !== "free" && "✓"}
                </span>
              </div>
            </button>

            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-update-modal"))
              }
              className="group flex items-center gap-3 p-4 rounded-xl border-2 border-border/30 bg-card/20 hover:bg-card/40 hover:border-primary/30 transition-all duration-200 text-left w-full"
            >
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary group-hover:rotate-12 transition-transform">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-semibold text-sm text-foreground leading-none">
                  {t("settings.actions.checkUpdates")}
                </span>
                <span className="text-xs text-muted-foreground leading-none">
                  {t("common.current")}: v{appVersion}
                </span>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <Button
              variant="destructive"
              className="w-full gap-2 h-11 border-2 border-destructive/20 hover:bg-destructive/90 transition-all duration-200 shadow-lg shadow-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-semibold">{t("settings.actions.signOut")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
