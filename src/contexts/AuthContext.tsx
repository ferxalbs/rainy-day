import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { checkAuthStatus, startGoogleAuth, logout } from "../services/auth";
import type { AuthStatus, UserInfo } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  user: UserInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    is_authenticated: false,
    user: null,
    expires_at: null,
  });

  const refresh = async () => {
    try {
      const status = await checkAuthStatus();
      setAuthStatus(status);
    } catch (error) {
      console.error("Failed to refresh auth status:", error);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // This will open browser and wait for callback
      const status = await startGoogleAuth();
      setAuthStatus(status);
    } catch (error) {
      console.error("Failed to complete login:", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setAuthStatus({
        is_authenticated: false,
        user: null,
        expires_at: null,
      });
    } catch (error) {
      console.error("Failed to logout:", error);
      throw error;
    }
  };

  useEffect(() => {
    const init = async () => {
      await refresh();
      setIsLoading(false);
    };
    init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authStatus.is_authenticated,
        isLoading,
        isLoggingIn,
        user: authStatus.user,
        login: handleLogin,
        logout: handleLogout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
