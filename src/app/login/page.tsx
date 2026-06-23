"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthPrompt from "@/components/auth/AuthPrompt";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
      <AuthPrompt onSuccess={() => router.replace("/")} />
    </main>
  );
}
