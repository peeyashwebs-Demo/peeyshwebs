import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import {
  getTutorial,
  toggleLikeDoc,
  getLikeDoc,
  deleteTutorial,
  shareTutorial,
} from '@/lib/services/tutorialService';
import {
  addComment,
  deleteComment,
  subscribeComments,
} from '@/lib/services/commentService';
import { getUserProfile } from '@/lib/services/userService';
import type { Tutorial, Comment } from '@/lib/types';
import { FALLBACK_TUTORIALS } from '@/lib/hooks/useTutorials';
import {
  ArrowLeft,
  Heart,
  Share2,
  Send,
  Trash2,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function VideoPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [creatorName, setCreatorName] = useState('');

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    (async () => {
      try {
        let t = await getTutorial(id);
        if (!t) {
          t = FALLBACK_TUTORIALS.find((ft) => ft.tutorialId === id) || null;
        }
        setTutorial(t);
        if (t) {
          setLikeCount(t.likesCount || 0);
          if (user) {
            try {
              const isLiked = await getLikeDoc(user.uid, t.tutorialId);
              setLiked(isLiked);
            } catch {
              // couldn't check like state, default to false
            }
          }
          try {
            const profile = t.creatorId ? await getUserProfile(t.creatorId) : null;
            setCreatorName(profile?.displayName || t.authorName || (t.creatorId?.slice(0, 8) ?? 'User'));
          } catch {
            setCreatorName(t.authorName || (t.creatorId?.slice(0, 8) ?? 'User'));
          }
        }
      } catch {
        const fallback = FALLBACK_TUTORIALS.find((ft) => ft.tutorialId === id);
        if (fallback) {
          setTutorial(fallback);
          setLikeCount(fallback.likesCount || 0);
          setCreatorName(fallback.authorName || (fallback.creatorId?.slice(0, 8) ?? 'User'));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setCommentsLoading(true);
    const unsub = subscribeComments(
      id,
      (data) => {
        setComments(data);
        setCommentsLoading(false);
      },
      () => {
        setCommentsLoading(false);
      },
    );
    return unsub;
  }, [id]);

  const handleLike = async () => {
    if (!tutorial || !user) {
      toast('Sign in to like videos', 'info');
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    toggleLikeDoc(user.uid, tutorial.tutorialId, liked).catch(() => {});
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast('Link copied!', 'success');
      if (tutorial) {
        shareTutorial(tutorial.tutorialId).catch(() => {});
      }
    } catch {
      toast('Failed to copy link', 'error');
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !user || !id) return;
    const text = commentText.trim();
    const displayName = userProfile?.displayName || user.email?.split('@')[0] || 'User';
    const avatarUrl = userProfile?.avatarUrl || '';
    const localId = `${user.uid}_${Date.now()}`;
    setCommentText('');
    setComments((prev) => [
      ...prev,
      {
        commentId: localId,
        tutorialId: id as string,
        userId: user.uid,
        userName: displayName,
        userAvatar: avatarUrl,
        text,
        parentCommentId: null,
        timestamp: Date.now(),
      },
    ]);
    addComment(
      id as string,
      user.uid,
      displayName,
      avatarUrl,
      text,
      null,
    ).catch(() => {});
  };

  const handleDeleteComment = async (comment: Comment) => {
    deleteComment(comment.commentId, comment.tutorialId).catch(() => {});
  };

  const handleDeleteTutorial = async () => {
    if (!tutorial) return;
    if (window.confirm('Delete this tutorial permanently?')) {
      try {
        await deleteTutorial(tutorial.tutorialId);
        toast('Tutorial deleted', 'success');
        router.push('/');
      } catch {
        toast('Failed to delete tutorial', 'error');
      }
    }
  };

  const topLevel = comments.filter((c) => !c.parentCommentId);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg text-text-secondary dark:text-text-secondary-dark">
          Video not found
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-accent hover:text-accent-hover"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  const youtubeId = tutorial.mediaUrl ? getYouTubeId(tutorial.mediaUrl) : null;
  const isOwner = user?.uid === tutorial.creatorId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Head>
        <title>{tutorial.title} - L - Hub</title>
      </Head>

      <button
        onClick={() => router.push('/')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition hover:text-accent"
      >
        <ArrowLeft size={18} />
        Back to videos
      </button>

      {youtubeId && (
        <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title={tutorial.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          {tutorial.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary dark:text-text-secondary-dark">
          <span className="flex items-center gap-1">
            <Calendar size={15} />
            {new Date(tutorial.creationDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <User size={15} />
            {creatorName}
          </span>
        </div>

        <p className="mt-4 text-text-primary dark:text-text-primary-dark leading-relaxed">
          {tutorial.description}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-base font-semibold transition-all duration-200 ${
              liked
                ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-900/20'
                : 'border-border dark:border-border-dark text-text-secondary dark:text-text-secondary-dark hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:hover:border-red-800 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart
              size={22}
              className={`transition-transform duration-200 ${liked ? 'fill-red-500 scale-110' : ''}`}
            />
            {likeCount}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full border border-border dark:border-border-dark px-5 py-2.5 text-base font-semibold text-text-secondary dark:text-text-secondary-dark transition hover:bg-card dark:hover:bg-card-dark"
          >
            <Share2 size={20} />
            Share
          </button>

          {isOwner && (
            <button
              onClick={handleDeleteTutorial}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <hr className="my-8 border-border dark:border-border-dark" />

      <div>
        <h3 className="mb-4 text-lg font-semibold text-text-primary dark:text-text-primary-dark">
          Comments ({comments.length})
        </h3>

        {user ? (
          <div className="mb-6 flex gap-3">
            <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-accent/20">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-accent">
                  {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                className="flex-1 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-2.5 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark outline-none focus:border-accent transition"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || sendingComment}
                className="rounded-xl bg-accent px-4 text-white transition hover:bg-accent-hover disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <p className="mb-6 text-sm text-text-secondary dark:text-text-secondary-dark">
            Sign in to leave a comment.
          </p>
        )}

        {commentsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-card dark:bg-card-dark p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-border dark:bg-border-dark" />
                  <div className="h-4 w-24 rounded bg-border dark:bg-border-dark" />
                </div>
                <div className="mt-3 h-3 w-3/4 rounded bg-border dark:bg-border-dark" />
              </div>
            ))}
          </div>
        ) : topLevel.length === 0 ? (
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="space-y-4">
            {topLevel.map((comment) => (
              <div
                key={comment.commentId}
                className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-accent/20">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-accent">
                        {comment.userName?.charAt(0).toUpperCase() || (comment.userId?.charAt(0).toUpperCase() ?? '?')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
                        {comment.userName || (comment.userId?.slice(0, 8) ?? 'User')}
                      </p>
                      {user?.uid === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment)}
                          className="shrink-0 rounded p-1 text-text-secondary dark:text-text-secondary-dark transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-primary dark:text-text-primary-dark">
                      {comment.text}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
                      {new Date(comment.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}