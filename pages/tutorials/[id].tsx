import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import {
  getTutorial,
  toggleLikeDoc,
  getLikeDoc,
  deleteTutorial,
} from '@/lib/services/tutorialService';
import { getUserProfile } from '@/lib/services/userService';
import MediaPlayer from '@/components/MediaPlayer';
import LikeButton from '@/components/LikeButton';
import ShareButton from '@/components/ShareButton';
import CommentSection from '@/components/CommentSection';
import type { Tutorial } from '@/lib/types';
import { Trash2, Calendar, User, ArrowLeft } from 'lucide-react';
import { FALLBACK_TUTORIALS } from '@/lib/hooks/useTutorials';

export async function getStaticPaths() {
  const paths = FALLBACK_TUTORIALS.map((t) => ({
    params: { id: t.tutorialId },
  }));
  return { paths, fallback: true };
}

export async function getStaticProps() {
  return { props: {} };
}

export default function TutorialView() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [creatorName, setCreatorName] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      const t = await getTutorial(id as string);
      setTutorial(t);
      setLoading(false);
      if (t) {
        if (user) {
          const isLiked = await getLikeDoc(user.uid, t.tutorialId);
          setLiked(isLiked);
        }
        const profile = t.creatorId ? await getUserProfile(t.creatorId) : null;
        setCreatorName(profile?.displayName || (t.creatorId?.slice(0, 8) ?? 'User'));
      }
    })();
  }, [id, user]);

  const handleLike = async () => {
    if (!tutorial || !user) {
      toast('Sign in to like tutorials', 'info');
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setTutorial((prev) =>
      prev ? { ...prev, likesCount: prev.likesCount + (newLiked ? 1 : -1) } : prev,
    );
    try {
      await toggleLikeDoc(user.uid, tutorial.tutorialId, liked);
    } catch {
      setLiked(!newLiked);
      setTutorial((prev) =>
        prev ? { ...prev, likesCount: prev.likesCount + (newLiked ? -1 : 1) } : prev,
      );
      toast('Failed to update like', 'error');
    }
  };

  const handleDelete = async () => {
    if (!tutorial) return;
    if (window.confirm('Delete this tutorial permanently?')) {
      await deleteTutorial(tutorial.tutorialId);
      toast('Tutorial deleted', 'success');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-text-secondary dark:text-text-secondary-dark">
          Tutorial not found
        </p>
        <Link href="/" className="mt-4 inline-block text-accent hover:text-accent-hover">
          Back to Discover
        </Link>
      </div>
    );
  }

  const isOwner = user?.uid === tutorial.creatorId;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="mx-auto max-w-4xl">
      <Head>
        <title>{tutorial.title} - L - Hub</title>
      </Head>

      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition hover:text-accent"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <MediaPlayer
        mediaType={tutorial.mediaType}
        mediaUrl={tutorial.mediaUrl}
        title={tutorial.title}
        autoplay
      />

      <div className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              {tutorial.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary dark:text-text-secondary-dark">
              <span className="flex items-center gap-1">
                <Calendar size={15} />
                {new Date(tutorial.creationDate || Date.now()).toLocaleDateString()}
              </span>
              <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                {tutorial.category || 'General'}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <User size={15} />
                {creatorName}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tutorial.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-text-primary dark:text-text-primary-dark leading-relaxed">
          {tutorial.description}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <LikeButton liked={liked} count={tutorial.likesCount} onToggle={handleLike} />
          <ShareButton url={shareUrl} title={tutorial.title} />
        </div>
      </div>

      <hr className="my-8 border-border dark:border-border-dark" />

      <CommentSection tutorialId={tutorial.tutorialId} />
    </div>
  );
}