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
  user: UserInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
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
    try {
      await startGoogleAuth();
      // The OAuth callback will handle setting the tokens
      // We'll need to poll or listen for the callback
    } catch (error) {
      console.error("Failed to start login:", error);
      throw error;
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
