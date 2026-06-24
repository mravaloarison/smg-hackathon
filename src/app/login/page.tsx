"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPrompt from "@/components/auth/AuthPrompt";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

function LoginPageContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return (
      <main className="mx-auto flex max-w-3xl w-full flex-col px-4 py-10">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl w-full flex-col px-4 py-10">
      <AuthPrompt defaultMode={defaultMode} onSuccess={() => router.replace("/")} />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
