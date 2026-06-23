import Link from "next/link";
import Artwork from "@/components/ui/Artwork";
import { UserProfile } from "@/lib/firestore/types";

interface UserCardProps {
  user: UserProfile;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <Link
      href={`/profile/${user.uid}`}
      className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <Artwork src={user.photoURL ?? undefined} alt={user.username} size={48} rounded="full" />
      <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {user.username}
      </p>
    </Link>
  );
}
