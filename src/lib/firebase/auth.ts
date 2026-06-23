import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfileIfMissing } from "@/lib/firestore/users";

function defaultUsernameFromEmail(email: string): string {
  return email.split("@")[0];
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: username });
  await createUserProfileIfMissing(credential.user.uid, email, username, null);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;
  await createUserProfileIfMissing(
    user.uid,
    user.email ?? "",
    user.displayName ?? defaultUsernameFromEmail(user.email ?? "user"),
    user.photoURL
  );
  return user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
