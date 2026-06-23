import Artwork from "@/components/ui/Artwork";
import { UserProfile } from "@/lib/firestore/types";

interface ProfileViewProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

export default function ProfileView({ profile, isOwnProfile, onEdit }: ProfileViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <Artwork
        src={profile.photoURL ?? undefined}
        alt={profile.username}
        size={120}
        rounded="full"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {profile.username}
        </h1>
        {isOwnProfile && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{profile.email}</p>
        )}
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Joined {new Date(profile.createdAt).toLocaleDateString()}
        </p>
      </div>
      {isOwnProfile && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Edit profile
        </button>
      )}
    </div>
  );
}
