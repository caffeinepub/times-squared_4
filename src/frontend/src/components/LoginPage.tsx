import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPageProps {
  onSuccess: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();

  const isLoggingIn = loginStatus === "logging-in";
  const isLoggedIn = !!identity;

  // After login + actor is ready, navigate home (admin is in the drawer)
  useEffect(() => {
    if (!isLoggedIn || !actor || isFetching) return;
    onSuccess();
  }, [isLoggedIn, actor, isFetching, onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-5"
    >
      <p className="section-label mb-6">Account Access</p>

      <h1
        className="font-editorial font-black text-white text-center mb-10"
        style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
      >
        Sign In
      </h1>

      {isInitializing ? (
        <div
          className="flex items-center gap-2 text-white/40"
          data-ocid="login.loading_state"
        >
          <Loader2 size={18} className="animate-spin" />
          <span className="font-sans text-sm">Initializing...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => login()}
          disabled={isLoggingIn}
          className="flex items-center gap-3 bg-white text-black font-sans font-semibold px-10 py-4 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
          style={{
            borderRadius: "9999px",
            fontSize: "15px",
            letterSpacing: "0.02em",
          }}
          data-ocid="login.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Connecting...
            </>
          ) : (
            "Login with Internet Identity"
          )}
        </button>
      )}

      <p className="font-sans text-white/25 mt-10 text-xs tracking-widest uppercase text-center max-w-xs">
        Secure, anonymous authentication via the Internet Computer
      </p>
    </motion.div>
  );
}
