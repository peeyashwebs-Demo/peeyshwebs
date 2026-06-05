import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Play, Check } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { toggleLikeDoc } from '@/lib/services/tutorialService';
import type { Tutorial } from '@/lib/types';

interface TutorialCardProps {
  tutorial: Tutorial;
  liked?: boolean;
  onLikeChange?: (tutorialId: string, liked: boolean) => void;
}

export default function TutorialCard({ tutorial, liked = false, onLikeChange }: TutorialCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(tutorial.likesCount || 0);
  const [copied, setCopied] = useState(false);

  const videoUrl = typeof window !== 'undefined' ? `${window.location.origin}/video/${tutorial.tutorialId}` : '';

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Sign in to like tutorials', 'info');
      return;
    }
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    try {
      await toggleLikeDoc(user.uid, tutorial.tutorialId, isLiked);
      onLikeChange?.(tutorial.tutorialId, newLiked);
    } catch {
      setIsLiked(!newLiked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      toast('Link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy', 'error');
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/video/${tutorial.tutorialId}`;
  };

  return (
    <Link
      href={`/video/${tutorial.tutorialId}`}
      className="group block overflow-hidden rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="relative aspect-video overflow-hidden bg-card dark:bg-card-dark">
        {tutorial.thumbnailUrl ? (
          <img
            src={tutorial.thumbnailUrl}
            alt={tutorial.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-secondary dark:text-text-secondary-dark">
            <Play size={40} />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />

        {tutorial.mediaType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/90 text-white opacity-80 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
              <Play size={26} className="ml-0.5" />
            </div>
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {tutorial.mediaType === 'video' ? 'Video' : 'Images'}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-text-primary dark:text-text-primary-dark">
          {tutorial.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-text-secondary dark:text-text-secondary-dark">
          {tutorial.description}
        </p>

        <p className="mt-2 text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
          {tutorial.authorName || tutorial.creatorId.slice(0, 8)}
        </p>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition ${
              isLiked ? 'text-red-500' : 'text-text-secondary dark:text-text-secondary-dark hover:text-red-500'
            }`}
          >
            <Heart size={16} className={isLiked ? 'fill-red-500' : ''} />
            {likeCount}
          </button>
          <button
            onClick={handleComment}
            className="flex items-center gap-1.5 text-text-secondary dark:text-text-secondary-dark transition hover:text-accent"
          >
            <MessageCircle size={16} />
            {tutorial.commentsCount || 0}
          </button>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 transition ${
              copied ? 'text-green-500' : 'text-text-secondary dark:text-text-secondary-dark hover:text-accent'
            }`}
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
    </Link>
  );
}