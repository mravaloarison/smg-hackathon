"use client";

import { useState } from "react";
import AuthGate from "@/components/auth/AuthGate";
import ProfileView from "@/components/profile/ProfileView";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile } from "@/lib/firestore/users";
import UserChordsSection from "@/components/profile/UserChordsSection";

function ProfilePageContent() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function handleSave(updates: { username: string; photoURL: string | null }) {
    if (!user) return;
    setIsSubmitting(true);
    setError(false);
    try {
      await updateUserProfile(user.uid, updates);
      setIsEditing(false);
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {error && <ErrorMessage message="Could not save profile changes." />}
      {isEditing ? (
        <ProfileEditForm
          profile={profile}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          isSubmitting={isSubmitting}
        />
      ) : (
        <>
          <ProfileView profile={profile} isOwnProfile onEdit={() => setIsEditing(true)} />
          <UserChordsSection uid={profile.uid} />
        </>
      )}
    </>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <main className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6">
        <ProfilePageContent />
      </main>
    </AuthGate>
  );
}
