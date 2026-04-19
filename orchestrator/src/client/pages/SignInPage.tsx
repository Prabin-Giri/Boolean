import {
  hasAuthenticatedSession,
  registerWithCredentials,
  restoreAuthSessionFromLegacyCredentials,
  signInWithCredentials,
} from "@client/api";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function resolveNextPath(rawNext: string | null): string {
  if (!rawNext || !rawNext.startsWith("/")) return "/jobs/ready";
  if (rawNext === "/sign-in" || rawNext.startsWith("/sign-in?")) {
    return "/jobs/ready";
  }
  return rawNext;
}

type AuthMode = "sign-in" | "register";

function resolveAuthMode(rawMode: string | null): AuthMode {
  return rawMode === "register" ? "register" : "sign-in";
}

export function SignInPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isBusy, setIsBusy] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { nextPath, requestedMode } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      nextPath: resolveNextPath(params.get("next")),
      requestedMode: resolveAuthMode(params.get("mode")),
    };
  }, [location.search]);
  const [authMode, setAuthMode] = useState<AuthMode>(requestedMode);

  useEffect(() => {
    setAuthMode(requestedMode);
  }, [requestedMode]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const restored = await restoreAuthSessionFromLegacyCredentials();
        if (cancelled) return;
        if (restored || hasAuthenticatedSession()) {
          navigate(nextPath, { replace: true });
          return;
        }
      } finally {
        if (!cancelled) {
          setIsBusy(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, nextPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setErrorMessage("Enter both username and password.");
      return;
    }
    if (authMode === "register" && normalizedUsername.length < 3) {
      setErrorMessage("Username must be at least 3 characters.");
      return;
    }
    if (authMode === "register" && password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (authMode === "register" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      if (authMode === "register") {
        await registerWithCredentials(normalizedUsername, password);
      } else {
        await signInWithCredentials(normalizedUsername, password);
      }
      navigate(nextPath, { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : authMode === "register"
            ? "Unable to create account"
            : "Unable to sign in",
      );
      setIsBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,119,198,0.08),_transparent_45%),linear-gradient(180deg,_rgba(15,23,42,0.02),_transparent_30%)] px-4 py-16">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <Card className="w-full border-border/60 bg-background/95 shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl tracking-tight">
              {authMode === "register" ? "Create account" : "Sign in"}
            </CardTitle>
            <CardDescription>
              {authMode === "register"
                ? "Create a JobOps account to keep using the workspace with your own login."
                : "Sign in with an existing JobOps account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/40 p-1">
              <Button
                type="button"
                variant={authMode === "sign-in" ? "default" : "ghost"}
                onClick={() => {
                  setAuthMode("sign-in");
                  setErrorMessage(null);
                }}
                disabled={isBusy}
              >
                Sign in
              </Button>
              <Button
                type="button"
                variant={authMode === "register" ? "default" : "ghost"}
                onClick={() => {
                  setAuthMode("register");
                  setErrorMessage(null);
                }}
                disabled={isBusy}
              >
                New account
              </Button>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="auth-username">
                  Username
                </label>
                <Input
                  id="auth-username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.currentTarget.value)}
                  placeholder="Enter username"
                  disabled={isBusy}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="auth-password">
                  Password
                </label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete={
                    authMode === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  placeholder="Enter password"
                  disabled={isBusy}
                />
                {authMode === "register" ? (
                  <p className="text-xs text-muted-foreground">
                    Use at least 8 characters.
                  </p>
                ) : null}
              </div>
              {authMode === "register" ? (
                <div className="space-y-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="auth-confirm-password"
                  >
                    Confirm password
                  </label>
                  <Input
                    id="auth-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.currentTarget.value)
                    }
                    placeholder="Re-enter password"
                    disabled={isBusy}
                  />
                </div>
              ) : null}
              {errorMessage ? (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              ) : null}
              <Button className="w-full" type="submit" disabled={isBusy}>
                {isBusy
                  ? authMode === "register"
                    ? "Creating account..."
                    : "Signing in..."
                  : authMode === "register"
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
