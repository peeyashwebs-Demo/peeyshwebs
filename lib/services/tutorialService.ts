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

function normalizeTutorial(doc: { id: string; data: () => Record<string, unknown> }): Tutorial {
  const raw = doc.data() as Record<string, unknown>;
  return {
    tutorialId: doc.id,
    creatorId: (raw.creatorId as string) || '',
    authorName: raw.authorName as string | undefined,
    title: (raw.title as string) || 'Untitled',
    description: (raw.description as string) || '',
    mediaType: (raw.mediaType as 'video' | 'image') || 'video',
    mediaUrl: (raw.mediaUrl as string) || '',
    thumbnailUrl: (raw.thumbnailUrl as string) || '',
    category: (raw.category as string) || 'General',
    tags: (raw.tags as string[]) || [],
    creationDate: (raw.creationDate as number) || Date.now(),
    updateDate: (raw.updateDate as number) || Date.now(),
    likesCount: (raw.likesCount as number) || 0,
    commentsCount: (raw.commentsCount as number) || 0,
    shareCount: (raw.shareCount as number) || 0,
  };
}

export async function getTutorial(id: string): Promise<Tutorial | null> {
  const snap = await getDoc(doc(db, TUTORIALS, id));
  return snap.exists() ? normalizeTutorial(snap) : null;
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
  return snap.docs.map(normalizeTutorial);
}

export async function getAllTutorials(): Promise<Tutorial[]> {
  const snap = await getDocs(collection(db, TUTORIALS));
  return snap.docs.map(normalizeTutorial);
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
