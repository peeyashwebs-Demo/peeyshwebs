import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUserProfile(uid: string, data: Partial<User>) {
  await updateDoc(doc(db, 'users', uid), data);
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
