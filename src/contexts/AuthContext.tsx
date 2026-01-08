/**
 * Auth Context
 *
 * Manages authentication state using the backend's JWT auth system.
 * The login flow uses polling-based OAuth through the backend.
 */

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import {
  connectToBackend,
  disconnectFromBackend,
  isBackendConnected,
  getBackendUser,
  type BackendUser,
} from "../services/backend/auth";
import { checkBackendHealth } from "../services/backend/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  user: BackendUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<BackendUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      // Check if we have tokens stored
      const connected = await isBackendConnected();
      setIsAuthenticated(connected);

      if (connected) {
        const userData = await getBackendUser();
        setUser(userData);
        if (!userData) {
          // Token is invalid, clear auth state
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Check if backend is available
      const backendAvailable = await checkBackendHealth();
      if (!backendAvailable) {
        throw new Error(
          "Backend server not available. Please start the server first."
        );
      }

      // Use backend polling auth flow
      const userData = await connectToBackend();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to complete login:", error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await disconnectFromBackend();
      setUser(null);
      setIsAuthenticated(false);
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
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isLoggingIn,
        user,
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
