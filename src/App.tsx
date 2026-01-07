import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GoogleSignIn } from "./components/auth/GoogleSignIn";
import { MainLayout } from "./components/layout/MainLayout";
import { CommandPalette } from "./components/CommandPalette";
import "./App.css";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

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
