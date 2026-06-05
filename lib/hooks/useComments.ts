import { useState, useEffect } from 'react';
import type { Comment } from '@/lib/types';
import { subscribeComments } from '@/lib/services/commentService';

export function useComments(tutorialId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tutorialId) return;
    setLoading(true);
    const unsub = subscribeComments(tutorialId, (data) => {
      setComments(data);
      setLoading(false);
    });
    return unsub;
  }, [tutorialId]);

  return { comments, loading };
}