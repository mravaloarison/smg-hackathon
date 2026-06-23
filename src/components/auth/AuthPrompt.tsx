"use client";

import { useState } from "react";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/firebase/auth";

interface AuthPromptProps {
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

type Mode = "signin" | "signup";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code.includes("email-already-in-use")) return "That email is already registered.";
    if (code.includes("invalid-credential") || code.includes("wrong-password")) {
      return "Incorrect email or password.";
    }
    if (code.includes("user-not-found")) return "No account found with that email.";
    if (code.includes("weak-password")) return "Password must be at least 6 characters.";
    if (code.includes("popup-closed-by-user")) return "Google sign-in was cancelled.";
  }
  return "Something went wrong. Please try again.";
}

export default function AuthPrompt({
  title = "Sign in to continue",
  description = "Sign in or create an account to search and save music.",
  onSuccess,
}: AuthPromptProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(email: string, password: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp(email: string, password: string, username: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, username);
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      </div>

      <div className="flex rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full py-1.5 text-sm font-medium transition ${
            mode === "signin"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-neutral-100"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-1.5 text-sm font-medium transition ${
            mode === "signup"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-neutral-100"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Sign up
        </button>
      </div>

      {mode === "signin" ? (
        <SignInForm onSubmit={handleSignIn} isSubmitting={isSubmitting} />
      ) : (
        <SignUpForm onSubmit={handleSignUp} isSubmitting={isSubmitting} />
      )}

      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        or
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <GoogleSignInButton onClick={handleGoogleSignIn} isSubmitting={isSubmitting} />

      {error && <ErrorMessage message={error} />}
    </div>
  );
}
