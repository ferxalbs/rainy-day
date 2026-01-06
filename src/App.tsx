import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { GoogleSignIn } from "./components/auth/GoogleSignIn";
import { DailyPlan } from "./components/plan/DailyPlan";
import "./styles/globals.css";

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

  return <DailyPlan />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
