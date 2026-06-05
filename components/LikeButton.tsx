import { Heart } from 'lucide-react';

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
}

export default function LikeButton({ liked, count, onToggle }: LikeButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`group flex items-center gap-2 rounded-full border px-5 py-2.5 text-base font-semibold transition-all duration-200 ${
        liked
          ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-900/20'
          : 'border-border dark:border-border-dark text-text-secondary dark:text-text-secondary-dark hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:hover:border-red-800 dark:hover:bg-red-900/20'
      }`}
    >
      <Heart
        size={22}
        className={`transition-transform duration-200 ${
          liked ? 'fill-red-500 scale-110' : ''
        } group-hover:scale-110`}
      />
      {count}
    </button>
  );
}
