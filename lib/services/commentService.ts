import {
  collection,
  doc,
  getDocs,
  query,
  where,
  increment,
  deleteDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Comment } from '@/lib/types';

const COMMENTS = 'comments';

export async function addComment(
  tutorialId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  text: string,
  parentCommentId: string | null = null,
) {
  const commentId = `${userId}_${Date.now()}`;
  await setDoc(doc(db, COMMENTS, commentId), {
    tutorialId,
    userId,
    userName,
    userAvatar,
    text,
    parentCommentId,
    timestamp: Date.now(),
  });

  setDoc(doc(db, 'tutorials', tutorialId), {
    commentsCount: increment(1),
  }, { merge: true }).catch(() => {});

  return commentId;
}

export async function deleteComment(commentId: string, tutorialId: string) {
  await deleteDoc(doc(db, COMMENTS, commentId));
  await setDoc(doc(db, 'tutorials', tutorialId), {
    commentsCount: increment(-1),
  }, { merge: true });
}

export async function getComments(tutorialId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS),
    where('tutorialId', '==', tutorialId),
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ commentId: d.id, ...d.data() } as Comment));
  list.sort((a, b) => a.timestamp - b.timestamp);
  return list;
}

export function subscribeComments(
  tutorialId: string,
  callback: (comments: Comment[]) => void,
  onError?: () => void,
): Unsubscribe {
  const q = query(
    collection(db, COMMENTS),
    where('tutorialId', '==', tutorialId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ commentId: d.id, ...d.data() } as Comment));
      list.sort((a, b) => a.timestamp - b.timestamp);
      callback(list);
    },
    () => {
      onError?.();
    },
  );
}
