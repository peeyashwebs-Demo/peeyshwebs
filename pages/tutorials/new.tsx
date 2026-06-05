import { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import { createTutorial, uploadMedia } from '@/lib/services/tutorialService';
import { Upload, X, Film, Image, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Design', 'Development', 'Photography', 'Music', 'Cooking',
  'Fitness', 'Technology', 'Art', 'Science', 'Business', 'Other',
];

export default function NewTutorial() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsStr, setTagsStr] = useState('');
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (f.type.startsWith('video/')) setMediaType('video');
      else if (f.type.startsWith('image/')) setMediaType('image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;
    setUploading(true);
    setError('');

    try {
      const ext = file.name.split('.').pop();
      const path = `tutorials/${user.uid}/${Date.now()}.${ext}`;
      const mediaUrl = await uploadMedia(file, path, setProgress);

      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const tutorialId = await createTutorial({
        creatorId: user.uid,
        title,
        description,
        mediaType,
        mediaUrl,
        thumbnailUrl: mediaType === 'image' ? mediaUrl : '',
        category,
        tags,
      });

      router.push(`/video/${tutorialId}`);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Create Tutorial - L - Hub</title>
      </Head>

      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Create Tutorial
        </h1>
        <p className="mt-1 text-text-secondary dark:text-text-secondary-dark">
          Share your knowledge with the community
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Media File
            </label>
            {file ? (
              <div className="relative overflow-hidden rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark">
                {mediaType === 'video' ? (
                  <video src={URL.createObjectURL(file)} className="max-h-64 w-full object-contain" controls />
                ) : (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-64 w-full object-contain" />
                )}
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                  {mediaType === 'video' ? <Film size={16} /> : <Image size={16} />}
                  {file.name}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border dark:border-border-dark bg-card dark:bg-card-dark px-6 py-12 text-text-secondary dark:text-text-secondary-dark transition hover:border-accent hover:text-accent"
              >
                <Upload size={32} />
                <span className="text-sm font-medium">Drop or click to upload</span>
                <span className="text-xs">Video or Image files supported</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Give your tutorial a clear title"
              className="w-full rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark outline-none focus:border-accent transition"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe what users will learn..."
              className="w-full rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark outline-none focus:border-accent transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-text-primary-dark">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary dark:text-text-primary-dark">
                Media Type
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'video' | 'image')}
                className="w-full rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark outline-none"
              >
                <option value="video">Video</option>
                <option value="image">Image(s)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Tags
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. react, beginner, web-dev (comma separated)"
              className="w-full rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark outline-none focus:border-accent transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                <Loader2 size={16} className="animate-spin" />
                Uploading... {Math.round(progress)}%
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-card dark:bg-card-dark">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file || !title || !description}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Publish Tutorial'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
