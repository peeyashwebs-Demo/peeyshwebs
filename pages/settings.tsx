import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { updateUserProfile, uploadAvatar } from '@/lib/services/userService';
import { useToast } from '@/lib/context/ToastContext';
import { Sun, Moon, Save, User as UserIcon, Mail, Upload } from 'lucide-react';

export default function Settings() {
  const { user, userProfile, refreshProfile, updateProfileLocally } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

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
    try {
      await updateUserProfile(uid, { displayName, avatarUrl });
      await refreshProfile();
      setSaved(true);
      toast('Settings saved!', 'success');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast('Failed to save settings', 'error');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const uid = user?.uid || userProfile?.uid;
    setUploadError('');
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
      updateProfileLocally({ avatarUrl: url });
      toast('Avatar saved!', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to upload avatar';
      setUploadError(msg);
      toast(msg, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Settings - L - Hub</title>
      </Head>

      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Settings
        </h1>
        <p className="mt-1 text-text-secondary dark:text-text-secondary-dark">
          Customize your experience
        </p>

        <div className="mt-8 space-y-8">
          <section className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
              Profile
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary dark:text-text-primary-dark">
                  <UserIcon size={16} /> Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark outline-none focus:border-accent transition"
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
                  className="w-full rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark px-4 py-3 text-sm text-text-secondary dark:text-text-secondary-dark outline-none cursor-not-allowed"
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
                    className="flex-1 rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark outline-none focus:border-accent transition"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
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
                    <span className="text-xs text-text-secondary dark:text-text-secondary-dark">Preview</span>
                  </div>
                )}
                {avatarUrl && avatarUrl.startsWith('https://') && (
                  <p className="mt-1 break-all text-xs text-text-secondary dark:text-text-secondary-dark">
                    URL: {avatarUrl}
                  </p>
                )}
                {uploadError && (
                  <p className="mt-2 text-sm text-red-500 dark:text-red-400">{uploadError}</p>
                )}
              </div>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                <Save size={18} />
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
              Appearance
            </h2>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
              Choose between Light and Dim Mode
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition ${
                  theme === 'light'
                    ? 'border-accent bg-accent/5'
                    : 'border-border dark:border-border-dark hover:border-accent'
                }`}
              >
                <Sun size={28} className={theme === 'light' ? 'text-accent' : 'text-text-secondary dark:text-text-secondary-dark'} />
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-accent' : 'text-text-primary dark:text-text-primary-dark'}`}>Light</span>
              </button>

              <button
                onClick={() => theme !== 'dim' && toggleTheme()}
                className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition ${
                  theme === 'dim'
                    ? 'border-accent bg-accent/5'
                    : 'border-border dark:border-border-dark hover:border-accent'
                }`}
              >
                <Moon size={28} className={theme === 'dim' ? 'text-accent' : 'text-text-secondary dark:text-text-secondary-dark'} />
                <span className={`text-sm font-medium ${theme === 'dim' ? 'text-accent' : 'text-text-primary dark:text-text-primary-dark'}`}>Dim Mode</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
