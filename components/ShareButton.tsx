import { useState } from 'react';
import { Share2, Link, ExternalLink } from 'lucide-react';
import { useToast } from '@/lib/context/ToastContext';

interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard!', 'success');
    }
    setOpen(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    toast('Link copied to clipboard!', 'success');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border dark:border-border-dark px-5 py-2.5 text-base font-semibold text-text-secondary dark:text-text-secondary-dark transition hover:bg-card dark:hover:bg-card-dark"
      >
        <Share2 size={20} />
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-2 shadow-xl">
            <button
              onClick={handleShare}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary dark:text-text-primary-dark transition hover:bg-card dark:hover:bg-card-dark"
            >
              <Share2 size={18} />
              Share
            </button>
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary dark:text-text-primary-dark transition hover:bg-card dark:hover:bg-card-dark"
            >
              {<Link size={18} />}
              Copy Link
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary dark:text-text-primary-dark transition hover:bg-card dark:hover:bg-card-dark"
            >
              <ExternalLink size={18} /> Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary dark:text-text-primary-dark transition hover:bg-card dark:hover:bg-card-dark"
            >
              <ExternalLink size={18} /> Facebook
            </a>
          </div>
        </>
      )}
    </div>
  );
}
