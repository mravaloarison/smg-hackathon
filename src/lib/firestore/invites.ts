import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CollabInvite } from "./types";

const INVITES_COLLECTION = "collab_invites";
const PLAYLISTS_COLLECTION = "playlists";

export async function sendCollabInvite(
  invite: Omit<CollabInvite, "id" | "createdAt" | "status">
): Promise<void> {
  const ref = doc(collection(db, INVITES_COLLECTION));
  const fullInvite: CollabInvite = {
    ...invite,
    id: ref.id,
    createdAt: Date.now(),
    status: "pending",
  };
  await setDoc(ref, fullInvite);
}

export function subscribeToReceivedInvites(
  toUid: string,
  onChange: (invites: CollabInvite[]) => void
): () => void {
  const q = query(
    collection(db, INVITES_COLLECTION),
    where("toUid", "==", toUid),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    const invites = snap.docs.map((d) => d.data() as CollabInvite);
    invites.sort((a, b) => b.createdAt - a.createdAt);
    onChange(invites);
  });
}

export async function respondToInvite(
  inviteId: string,
  playlistId: string,
  toUid: string,
  accept: boolean
): Promise<void> {
  const inviteRef = doc(db, INVITES_COLLECTION, inviteId);
  await updateDoc(inviteRef, { status: accept ? "accepted" : "declined" });

  if (accept) {
    const playlistRef = doc(db, PLAYLISTS_COLLECTION, playlistId);
    await updateDoc(playlistRef, {
      collaboratorIds: arrayUnion(toUid),
    });
  }
}
