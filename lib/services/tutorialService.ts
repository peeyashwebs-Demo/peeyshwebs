import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  type QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Tutorial } from '@/lib/types';

const TUTORIALS = 'tutorials';

export async function createTutorial(
  data: Omit<Tutorial, 'tutorialId' | 'creationDate' | 'updateDate' | 'likesCount' | 'commentsCount' | 'shareCount'>,
) {
  const now = Date.now();
  const docRef = await addDoc(collection(db, TUTORIALS), {
    ...data,
    likesCount: 0,
    commentsCount: 0,
    shareCount: 0,
    creationDate: now,
    updateDate: now,
  });
  return docRef.id;
}

export async function getTutorial(id: string): Promise<Tutorial | null> {
  const snap = await getDoc(doc(db, TUTORIALS, id));
  return snap.exists() ? ({ tutorialId: snap.id, ...snap.data() } as Tutorial) : null;
}

export async function getTutorials(opts?: {
  category?: string;
  mediaType?: 'video' | 'image';
  tags?: string[];
  sortBy?: 'new' | 'trending' | 'rated';
  limitCount?: number;
}): Promise<Tutorial[]> {
  const constraints: QueryConstraint[] = [];

  if (opts?.category) {
    constraints.push(where('category', '==', opts.category));
  }
  if (opts?.mediaType) {
    constraints.push(where('mediaType', '==', opts.mediaType));
  }

  const sortField = opts?.sortBy === 'trending' ? 'likesCount' : 'creationDate';
  constraints.push(orderBy(sortField, 'desc'));

  if (opts?.limitCount) {
    constraints.push(limit(opts.limitCount));
  }

  const q = query(collection(db, TUTORIALS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ tutorialId: d.id, ...d.data() } as Tutorial));
}

export async function getAllTutorials(): Promise<Tutorial[]> {
  const snap = await getDocs(collection(db, TUTORIALS));
  return snap.docs.map((d) => ({ tutorialId: d.id, ...d.data() } as Tutorial));
}

export async function updateTutorial(id: string, data: Partial<Tutorial>) {
  await updateDoc(doc(db, TUTORIALS, id), { ...data, updateDate: Date.now() });
}

export async function deleteTutorial(id: string) {
  await deleteDoc(doc(db, TUTORIALS, id));
}

export async function likeTutorial(id: string, incrementBy: 1 | -1) {
  await setDoc(doc(db, TUTORIALS, id), {
    likesCount: increment(incrementBy),
  }, { merge: true });
}

export async function toggleLikeDoc(userId: string, videoId: string, liked: boolean) {
  const likeRef = doc(db, 'likes', `${userId}_${videoId}`);
  if (liked) {
    await deleteDoc(likeRef);
    await likeTutorial(videoId, -1);
  } else {
    await setDoc(likeRef, { userId, videoId, createdAt: Date.now() });
    await likeTutorial(videoId, 1);
  }
}

export async function shareTutorial(id: string) {
  await setDoc(doc(db, TUTORIALS, id), {
    shareCount: increment(1),
  }, { merge: true });
}

export async function getLikeDoc(userId: string, videoId: string): Promise<boolean> {
  const likeRef = doc(db, 'likes', `${userId}_${videoId}`);
  const snap = await getDoc(likeRef);
  return snap.exists();
}

export async function uploadMedia(file: File, path: string, onProgress?: (pct: number) => void): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      },
    );
  });
}
