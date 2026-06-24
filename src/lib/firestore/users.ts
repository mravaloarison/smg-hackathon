import {
  collection,
  doc,
  getDoc,
  getDocsFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { UserProfile } from "./types";

const USERS_COLLECTION = "users";

export async function createUserProfileIfMissing(
  uid: string,
  email: string,
  defaultUsername: string,
  photoURL: string | null
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  const profile: UserProfile = {
    uid,
    email,
    username: defaultUsername,
    usernameLower: defaultUsername.toLowerCase(),
    photoURL,
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export function subscribeToUserProfile(
  uid: string,
  onChange: (profile: UserProfile | null) => void
): () => void {
  return onSnapshot(doc(db, USERS_COLLECTION, uid), (snap) => {
    onChange(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function updateUserProfile(
  uid: string,
  updates: { username?: string; photoURL?: string | null }
): Promise<void> {
  const payload: Record<string, unknown> = { ...updates };
  if (updates.username) {
    payload.usernameLower = updates.username.toLowerCase();
  }
  await updateDoc(doc(db, USERS_COLLECTION, uid), payload);
}

export async function getUserProfiles(uids: string[]): Promise<UserProfile[]> {
  if (uids.length === 0) return [];
  const results = await Promise.all(uids.map((uid) => getUserProfile(uid)));
  return results.filter((p): p is UserProfile => p !== null);
}

export async function searchUsersByUsername(term: string): Promise<UserProfile[]> {
  const termLower = term.trim().toLowerCase();
  if (!termLower) return [];

  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(
    usersRef,
    where("usernameLower", ">=", termLower),
    where("usernameLower", "<=", termLower + "\uf8ff"),
    orderBy("usernameLower"),
    limit(20)
  );

  const snap = await getDocsFromServer(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}
