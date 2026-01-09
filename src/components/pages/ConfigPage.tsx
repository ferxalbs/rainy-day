import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotificationSettings } from "../../hooks/useNotificationSettings";
import { useSubscription } from "../../hooks/useSubscription";
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
} from "lucide-react";
import { Button } from "../ui/button";
import { checkBackendHealth, getBackendInfo } from "../../services/backend/api";
import { getVersion } from "@tauri-apps/api/app";
import { ModelSelector } from "../settings/ModelSelector";
import { UpgradePlanModal } from "../settings/UpgradePlanModal";

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
      // Auth wrapper will handle redirection
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const userSection: ConfigItem[] = [
    {
      icon: <User className="w-4 h-4" />,
      label: "Name",
      value: user?.name || "Not signed in",
    },
    {
      icon: <Mail className="w-4 h-4" />,
      label: "Email",
      value: user?.email || "—",
    },
  ];

  const appSection: ConfigItem[] = [
    {
      icon: <Info className="w-4 h-4" />,
      label: "App Name",
      value: APP_NAME,
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: "Version",
      value: `v${appVersion}`,
    },
    {
      icon: <Cloud className="w-4 h-4" />,
      label: "Backend",
      value: backendVersion
        ? `v${backendVersion}`
        : isBackendAvailable
        ? "Connected"
        : "Offline",
    },
    {
      icon: <Palette className="w-4 h-4" />,
      label: "Active Theme",
      value: `${themeName} (${currentTheme.mode})`,
    },
  ];

  const capabilities = [
    {
      icon: <Mail className="w-4 h-4" />,
      name: "Gmail Integration",
      status: isAuthenticated ? "Active" : "Disconnected",
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      name: "Google Calendar",
      status: isAuthenticated ? "Active" : "Disconnected",
    },
    {
      icon: <CheckSquare className="w-4 h-4" />,
      name: "Google Tasks",
      status: isAuthenticated ? "Active" : "Disconnected",
    },
    {
      icon: <Zap className="w-4 h-4" />,
      name: "AI Daily Plans",
      status: isAuthenticated ? "Enabled" : "Disconnected",
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
            Account
          </CardTitle>
          <CardDescription>Your signed-in account details</CardDescription>
        </CardHeader>
        <CardContent>{renderConfigItems(userSection)}</CardContent>
      </Card>

      {/* App Info Card */}
      <Card className="border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Application
          </CardTitle>
          <CardDescription>App version and configuration</CardDescription>
        </CardHeader>
        <CardContent>{renderConfigItems(appSection)}</CardContent>
      </Card>

      {/* Capabilities Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Capabilities
          </CardTitle>
          <CardDescription>Connected services and features</CardDescription>
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
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      cap.status === "Active" || cap.status === "Enabled"
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

      {/* Notification Settings Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/30 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Manage native OS notifications</CardDescription>
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
                  Enable Notifications
                </span>
                <span className="text-xs text-muted-foreground">
                  Receive native OS alerts for tasks and reminders
                </span>
              </div>
            </div>
            <Button
              variant={notificationsActive ? "default" : "outline"}
              size="sm"
              onClick={toggleNotifications}
              className="min-w-[80px]"
            >
              {notificationsActive ? "On" : "Off"}
            </Button>
          </div>

          <Separator />

          {/* Auto Initialize Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Auto-Request Permission
                </span>
                <span className="text-xs text-muted-foreground">
                  Automatically request permission on app start
                </span>
              </div>
            </div>
            <Button
              variant={notifSettings.autoInitialize ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoInitialize(!notifSettings.autoInitialize)}
              className="min-w-[80px]"
            >
              {notifSettings.autoInitialize ? "On" : "Off"}
            </Button>
          </div>

          {/* Status */}
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  notificationsActive ? "bg-green-500" : "bg-muted-foreground"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                Status:{" "}
                <span className="font-medium text-foreground">
                  {notificationsActive
                    ? "Active - notifications enabled"
                    : notifSettings.permissionState === "denied"
                    ? "Denied - enable in System Settings"
                    : "Disabled"}
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
            Actions
          </CardTitle>
          <CardDescription>Manage your session and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModelSelector onUpgradeClick={() => setShowUpgradeModal(true)} />

            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              onClick={() => setShowUpgradeModal(true)}
            >
              <Rocket className="w-4 h-4" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">Upgrade Plan</span>
                <span className="text-xs text-muted-foreground">
                  Current: {planName} {plan !== "free" && "✓"}
                </span>
              </div>
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-update-modal"))
              }
            >
              <RefreshCw className="w-4 h-4" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">Check for Updates</span>
                <span className="text-xs text-muted-foreground">
                  Current: v{appVersion}
                </span>
              </div>
            </Button>
          </div>

          <Separator />

          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
