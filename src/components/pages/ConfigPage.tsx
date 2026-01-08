import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
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
  Bot,
  Rocket,
  Cloud,
} from "lucide-react";
import { Button } from "../ui/button";
import { checkBackendHealth, getBackendInfo } from "../../services/backend/api";

// App version from package.json would be injected at build time
const APP_VERSION = "0.1.15";
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
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  useEffect(() => {
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
      value: `v${APP_VERSION}`,
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
      <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-primary/5">
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
      <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-primary/5">
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
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-primary/5">
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

      {/* Actions Card */}
      <Card className="md:col-span-2 border-2 border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Actions
          </CardTitle>
          <CardDescription>Manage your session and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              disabled
            >
              <Bot className="w-4 h-4" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">AI Model</span>
                <span className="text-xs text-muted-foreground">
                  Select default model (Coming Soon)
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              disabled
            >
              <Rocket className="w-4 h-4" />
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">Upgrade Plan</span>
                <span className="text-xs text-muted-foreground">
                  Get more features (Coming Soon)
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
    </div>
  );
}
