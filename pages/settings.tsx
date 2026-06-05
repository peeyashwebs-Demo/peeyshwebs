import { useState } from 'react';
import Head from 'next/head';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { updateUserProfile } from '@/lib/services/userService';
import { Sun, Moon, Save, User as UserIcon, Mail } from 'lucide-react';

export default function Settings() {
  const { userProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!userProfile) return;
    await updateUserProfile(userProfile.uid, { displayName, avatarUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-xl border border-border dark:border-border-dark bg-background dark:bg-background-dark px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark outline-none focus:border-accent transition"
                />
                {avatarUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-card dark:bg-card-dark">
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                    <span className="text-xs text-text-secondary dark:text-text-secondary-dark">Preview</span>
                  </div>
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
