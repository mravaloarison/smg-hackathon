"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthPrompt from "@/components/auth/AuthPrompt";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AuthGateProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function AuthGate({ children, title, description }: AuthGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="mx-auto flex max-w-3xl w-full flex-col px-4 py-10">
        <LoadingSpinner />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex max-w-3xl w-full flex-col px-4 py-10">
        <AuthPrompt title={title} description={description} />
      </main>
    );
  }

  return <>{children}</>;
}
