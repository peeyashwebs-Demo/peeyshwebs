import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { User } from '@/lib/types';

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUserProfile(uid: string, data: Partial<User>) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `avatars/${uid}/${Date.now()}_${safeName}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

export async function toggleLikeTutorial(uid: string, tutorialId: string, isLiked: boolean) {
  const ref = doc(db, 'users', uid);
  if (isLiked) {
    await updateDoc(ref, { likedTutorials: arrayRemove(tutorialId) });
  } else {
    await updateDoc(ref, { likedTutorials: arrayUnion(tutorialId) });
  }
}

export async function addViewedTutorial(uid: string, tutorialId: string) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { viewedTutorials: arrayUnion(tutorialId) });
}
