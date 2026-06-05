import { useState, useEffect, useCallback } from 'react';
import type { Tutorial } from '@/lib/types';
import { getTutorials, getAllTutorials } from '@/lib/services/tutorialService';

const FALLBACK_TUTORIALS: Tutorial[] = [
  {
    tutorialId: 'fallback-1',
    creatorId: 'l-hub',
    authorName: 'React Masters',
    title: 'React 19: Everything You Need to Know',
    description: 'A complete walkthrough of the new React 19 features including Server Components, Actions, and the new hook APIs.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    thumbnailUrl: 'https://img.youtube.com/vi/SqcY0GlETPk/maxresdefault.jpg',
    category: 'Development',
    tags: ['react', 'frontend', 'javascript'],
    creationDate: Date.now() - 86400000,
    updateDate: Date.now(),
    likesCount: 12,
    commentsCount: 4,
  },
  {
    tutorialId: 'fallback-2',
    creatorId: 'l-hub',
    authorName: 'Firebase Zone',
    title: 'Firebase Authentication Tutorial',
    description: 'Learn how to implement email/password and social authentication using Firebase Auth in your web applications.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=1rN5N4sL1aA',
    thumbnailUrl: 'https://img.youtube.com/vi/1rN5N4sL1aA/maxresdefault.jpg',
    category: 'Technology',
    tags: ['firebase', 'auth', 'backend'],
    creationDate: Date.now() - 172800000,
    updateDate: Date.now(),
    likesCount: 8,
    commentsCount: 2,
  },
  {
    tutorialId: 'fallback-3',
    creatorId: 'l-hub',
    authorName: 'CSS Wizardry',
    title: 'Tailwind CSS Crash Course',
    description: 'Master utility-first CSS with Tailwind CSS. Build responsive, modern interfaces without writing custom CSS.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=UBOj6rqRUME',
    thumbnailUrl: 'https://img.youtube.com/vi/UBOj6rqRUME/maxresdefault.jpg',
    category: 'Development',
    tags: ['tailwind', 'css', 'frontend'],
    creationDate: Date.now() - 259200000,
    updateDate: Date.now(),
    likesCount: 15,
    commentsCount: 7,
  },
  {
    tutorialId: 'fallback-4',
    creatorId: 'l-hub',
    authorName: 'JS Ninja',
    title: 'JavaScript ES6 Features',
    description: 'Explore modern JavaScript features: arrow functions, destructuring, spread operator, promises, async/await, and more.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=WZQc7RUAg18',
    thumbnailUrl: 'https://img.youtube.com/vi/WZQc7RUAg18/maxresdefault.jpg',
    category: 'Development',
    tags: ['javascript', 'es6', 'web'],
    creationDate: Date.now() - 345600000,
    updateDate: Date.now(),
    likesCount: 20,
    commentsCount: 10,
  },
  {
    tutorialId: 'fallback-5',
    creatorId: 'l-hub',
    authorName: 'Node Guru',
    title: 'Node.js REST API Tutorial',
    description: 'Build a complete RESTful API with Node.js, Express, and MongoDB. Covers routing, middleware, authentication, and deployment.',
    mediaType: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4',
    thumbnailUrl: 'https://img.youtube.com/vi/fBNz5xF-Kx4/maxresdefault.jpg',
    category: 'Technology',
    tags: ['nodejs', 'api', 'backend'],
    creationDate: Date.now() - 432000000,
    updateDate: Date.now(),
    likesCount: 6,
    commentsCount: 3,
  },
];

export function useTutorials(opts?: {
  category?: string;
  mediaType?: 'video' | 'image';
  tags?: string[];
  sortBy?: 'new' | 'trending' | 'rated';
}) {
  const [tutorials, setTutorials] = useState<Tutorial[]>(FALLBACK_TUTORIALS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTutorials(opts)
      .then((data) => { if (data.length > 0) setTutorials(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [opts?.category, opts?.mediaType, opts?.sortBy, opts?.tags?.join(',')]);

  return { tutorials, loading };
}

export function useAllTutorials() {
  const [tutorials, setTutorials] = useState<Tutorial[]>(FALLBACK_TUTORIALS);
  const [loading, setLoading] = useState(true);

  const fetchTutorials = useCallback(async () => {
    try {
      const data = await getAllTutorials();
      const fallbackIds = new Set(FALLBACK_TUTORIALS.map((f) => f.tutorialId));
      setTutorials([...data.filter((d) => !fallbackIds.has(d.tutorialId)), ...FALLBACK_TUTORIALS]);
    } catch {
      // fallback already shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  return { tutorials, loading, refresh: fetchTutorials };
}

export { FALLBACK_TUTORIALS };
