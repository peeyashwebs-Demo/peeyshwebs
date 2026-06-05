import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { useToast } from '@/lib/context/ToastContext';
import { updateUserProfile, uploadAvatar } from '@/lib/services/userService';
import { createTutorial } from '@/lib/services/tutorialService';
import {
  Sun,
  Moon,
  PlusCircle,
  LogOut,
  Settings,
  X,
  Save,
  User as UserIcon,
  Mail,
  Film,
  Menu,
  Upload,
} from 'lucide-react';

function CreateTutorialModal({ onClose }: { onClose: () => void }) {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    setError('');

    const videoId = getYoutubeId(youtubeUrl);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    setSaving(true);
    try {
      const tutorialId = await createTutorial({
        creatorId: user.uid,
        authorName: userProfile?.displayName || 'User',
        title,
        description,
        mediaType: 'video',
        mediaUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        category: 'Technology',
        tags: ['youtube', 'tutorial'],
      });
      toast('Tutorial created!', 'success');
      onClose();
      router.push(`/video/${tutorialId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create tutorial');
      toast('Failed to create tutorial', 'error');
    } finally {
      setSaving(false);
    }
  };

  const videoId = getYoutubeId(youtubeUrl);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
            Create Tutorial
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-secondary hover:bg-card dark:hover:bg-card-dark">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {videoId ? (
              <div className="relative overflow-hidden rounded-xl border border-border dark:border-border-dark bg-black">
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt=""
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                    <Film size={24} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border dark:border-border-dark px-4 py-8 text-text-secondary">
                <Film size={32} />
                <span className="text-sm font-medium">YouTube video preview will appear here</span>
              </div>
            )}
          </div>
          <input
            type="url"
            placeholder="YouTube Video URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            required
            className="w-full rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-2.5 text-sm outline-none focus:border-accent resize-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving || !title || !youtubeUrl}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Publish'}
          </button>
        </form>
      </div>
    </div>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { user, userProfile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setAvatarUrl(userProfile.avatarUrl || '');
      setPreviewUrl(userProfile.avatarUrl || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    const uid = user?.uid || userProfile?.uid;
    if (!uid) return;
    setSaving(true);
    try {
      await updateUserProfile(uid, { displayName, avatarUrl });
      await refreshProfile();
      toast('Settings saved!', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const uid = user?.uid || userProfile?.uid;
    if (!file || !uid) {
      toast('No file selected or user not found', 'error');
      return;
    }
    setUploading(true);
    try {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      const url = await uploadAvatar(uid, file);
      URL.revokeObjectURL(localUrl);
      setAvatarUrl(url);
      setPreviewUrl(url);
      await updateUserProfile(uid, { avatarUrl: url });
      await refreshProfile();
      toast('Avatar saved!', 'success');
    } catch (err: any) {
      toast(err?.message || 'Failed to upload avatar', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
            Settings
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-secondary hover:bg-card dark:hover:bg-card-dark">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary dark:text-text-primary-dark">
              <UserIcon size={16} /> Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary dark:text-text-primary-dark">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              value={userProfile?.email || ''}
              disabled
              className="w-full rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark px-4 py-2.5 text-sm text-text-secondary outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Avatar
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="flex-1 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
              >
                <Upload size={18} />
                {uploading ? '...' : 'Upload'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            {previewUrl && (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-card dark:bg-card-dark">
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="text-xs text-text-secondary">Preview</span>
              </div>
            )}
          </div>

          <hr className="border-border dark:border-border-dark" />

          <div>
            <h3 className="mb-3 text-sm font-medium text-text-primary dark:text-text-primary-dark">
              Appearance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                  theme === 'light'
                    ? 'border-accent bg-accent/5'
                    : 'border-border dark:border-border-dark hover:border-accent'
                }`}
              >
                <Sun size={22} className={theme === 'light' ? 'text-accent' : 'text-text-secondary'} />
                <span className={`text-xs font-medium ${theme === 'light' ? 'text-accent' : 'text-text-primary dark:text-text-primary-dark'}`}>Light</span>
              </button>
              <button
                onClick={() => theme !== 'dim' && toggleTheme()}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                  theme === 'dim'
                    ? 'border-accent bg-accent/5'
                    : 'border-border dark:border-border-dark hover:border-accent'
                }`}
              >
                <Moon size={22} className={theme === 'dim' ? 'text-accent' : 'text-text-secondary'} />
                <span className={`text-xs font-medium ${theme === 'dim' ? 'text-accent' : 'text-text-primary dark:text-text-primary-dark'}`}>Dim Mode</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border dark:border-border-dark bg-background dark:bg-background-dark">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-accent">L</span>
            <span className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
              - Hub
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 sm:px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover hover:shadow-lg active:scale-95"
                >
                  <PlusCircle size={18} />
                  Create
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary dark:text-text-secondary-dark transition hover:bg-card dark:hover:bg-card-dark"
                  >
                    <div className="h-7 w-7 overflow-hidden rounded-full bg-accent/20 ring-2 ring-accent/30">
                      {userProfile?.avatarUrl ? (
                        <img src={userProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-accent">
                          {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:inline">{userProfile?.displayName || 'User'}</span>
                  </Link>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="rounded-lg p-2 text-text-secondary dark:text-text-secondary-dark transition hover:bg-card dark:hover:bg-card-dark"
                    title="Settings"
                  >
                    <Settings size={20} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg p-2 text-text-secondary dark:text-text-secondary-dark transition hover:bg-card dark:hover:bg-card-dark"
                    title="Sign out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>

                <div className="flex sm:hidden">
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="rounded-lg p-2 text-text-secondary dark:text-text-secondary-dark transition hover:bg-card dark:hover:bg-card-dark"
                    aria-label="Menu"
                  >
                    <Menu size={22} />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover hover:shadow-lg active:scale-95"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-text-secondary dark:text-text-secondary-dark transition hover:bg-card dark:hover:bg-card-dark"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && user && (
          <div className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark sm:hidden">
            <div className="space-y-1 px-4 py-3">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary dark:text-text-primary-dark transition hover:bg-card dark:hover:bg-card-dark"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full bg-accent/20">
                  {userProfile?.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-accent">
                      {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{userProfile?.displayName || 'User'}</p>
                  <p className="text-xs text-text-secondary">{userProfile?.email}</p>
                </div>
              </Link>
              <hr className="border-border dark:border-border-dark" />
              <button
                onClick={() => { setShowSettings(true); setMobileOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-primary dark:text-text-primary-dark transition hover:bg-card dark:hover:bg-card-dark"
              >
                <Settings size={18} className="text-text-secondary" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {showCreate && <CreateTutorialModal onClose={() => setShowCreate(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}