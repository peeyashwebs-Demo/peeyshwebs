import { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useToast } from '@/lib/context/ToastContext';
import { useComments } from '@/lib/hooks/useComments';
import { addComment, deleteComment } from '@/lib/services/commentService';
import type { Comment } from '@/lib/types';

interface CommentSectionProps {
  tutorialId: string;
}

export default function CommentSection({ tutorialId }: CommentSectionProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const { comments, loading } = useComments(tutorialId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const topLevel = comments.filter((c) => !c.parentCommentId);
  const replies = (parentId: string) => comments.filter((c) => c.parentCommentId === parentId);

  const handleSubmit = async () => {
    if (!text.trim() || !user || !userProfile) return;
    setSending(true);
    try {
      await addComment(
        tutorialId,
        user.uid,
        userProfile.displayName || 'User',
        userProfile.avatarUrl || '',
        text.trim(),
        null,
      );
      setText('');
    } catch {
      toast('Failed to post comment', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (comment: Comment) => {
    try {
      await deleteComment(comment.commentId, tutorialId);
      toast('Comment deleted', 'success');
    } catch {
      toast('Failed to delete comment', 'error');
    }
  };

  return (
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
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              className="flex-1 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-2.5 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark outline-none focus:border-accent transition"
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || sending}
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

      {loading ? (
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
            <CommentItem
              key={comment.commentId}
              comment={comment}
              replies={replies(comment.commentId)}
              isOwner={user?.uid === comment.userId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  isOwner,
  onDelete,
}: {
  comment: Comment;
  replies: Comment[];
  isOwner: boolean;
  onDelete: (comment: Comment) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(comment);
    setDeleting(false);
  };

  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4">
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
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="shrink-0 rounded p-1 text-text-secondary dark:text-text-secondary-dark transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                title="Delete"
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

      {replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3 border-l-2 border-border dark:border-border-dark pl-4">
          {replies.map((reply) => (
            <div key={reply.commentId} className="flex items-start gap-3">
              <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-accent/20">
                {reply.userAvatar ? (
                  <img src={reply.userAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-accent">
                    {reply.userName?.charAt(0).toUpperCase() || (reply.userId?.charAt(0).toUpperCase() ?? '?')}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  {reply.userName || (reply.userId?.slice(0, 8) ?? 'User')}
                </p>
                <p className="mt-0.5 text-sm text-text-primary dark:text-text-primary-dark">
                  {reply.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}