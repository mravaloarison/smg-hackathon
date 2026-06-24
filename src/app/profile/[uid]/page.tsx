"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/auth/AuthGate";
import ProfileView from "@/components/profile/ProfileView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import BackButton from "@/components/ui/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/lib/firestore/users";
import { UserProfile } from "@/lib/firestore/types";

function OtherProfileContent({ uid }: { uid: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting an async fetch, not deriving state
    setIsLoading(true);
    setError(false);

    getUserProfile(uid)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  return (
    <>
      <BackButton onClick={() => router.back()} />
      {isLoading && <LoadingSpinner />}
      {!isLoading && error && <ErrorMessage message="Could not load this profile." />}
      {!isLoading && !error && !profile && (
        <ErrorMessage message="This user could not be found." />
      )}
      {!isLoading && !error && profile && (
        <ProfileView profile={profile} isOwnProfile={profile.uid === user?.uid} />
      )}
    </>
  );
}

export default function OtherProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);

  return (
    <AuthGate>
      <main className="flex w-full flex-col px-6 py-10">
        <OtherProfileContent uid={uid} />
      </main>
    </AuthGate>
  );
}
