import { useAuth } from "../../contexts/AuthContext";
import "./GoogleSignIn.css";

export function GoogleSignIn() {
  const { login, isLoading } = useAuth();

  const handleSignIn = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  return (
    <div className="google-signin-container">
      <div className="signin-card glass">
        <div className="signin-header">
          <div className="logo">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="24" cy="24" r="20" fill="url(#gradient)" />
              <path
                d="M24 14C19.58 14 16 17.58 16 22C16 24.76 17.28 27.22 19.3 28.74L17.56 32.68L22.18 30.38C22.76 30.52 23.36 30.6 24 30.6C28.42 30.6 32 27 32 22.6C32 18.18 28.42 14.6 24 14.6V14Z"
                fill="white"
                fillOpacity="0.9"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="4"
                  y1="4"
                  x2="44"
                  y2="44"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="signin-title">Rainy Day</h1>
          <p className="signin-subtitle">
            Turn your inbox into an actionable daily plan
          </p>
        </div>

        <div className="signin-content">
          <p className="signin-description">
            Connect your Google account to get started. We'll help you focus on
            what matters most by organizing your emails, calendar, and tasks.
          </p>

          <button
            className="google-button"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
                fill="#4285F4"
              />
              <path
                d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13 18.63 6.71 16.69 5.84 14.09H2.18V16.94C3.99 20.53 7.7 23 12 23Z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.06H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.94L5.84 14.09Z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.37C13.62 5.37 15.06 5.93 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06L5.84 9.91C6.71 7.31 9.13 5.37 12 5.37Z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="signin-footer">
          <p className="privacy-note">
            We only request read access to your email and calendar.
            <br />
            Your data never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
