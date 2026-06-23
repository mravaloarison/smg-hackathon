import { Suspense } from "react";
import HomeClient from "@/components/home/HomeClient";
import AuthGate from "@/components/auth/AuthGate";

export default function Home() {
  return (
    <AuthGate
      title="Sign in to search music"
      description="Create an account or sign in to search songs, albums, and artists."
    >
      <Suspense>
        <HomeClient />
      </Suspense>
    </AuthGate>
  );
}
