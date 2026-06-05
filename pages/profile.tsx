import { useState, useMemo } from 'react';
import Head from 'next/head';
import ProtectedRoute from '@/components/ProtectedRoute';
import TutorialCard from '@/components/TutorialCard';
import { useAuth } from '@/lib/context/AuthContext';
import { useAllTutorials } from '@/lib/hooks/useTutorials';
import { Heart, Eye, Upload, BookOpen } from 'lucide-react';

type Tab = 'uploaded' | 'liked' | 'history';

export default function Profile() {
  const { user, userProfile } = useAuth();
  const { tutorials } = useAllTutorials();
  const [tab, setTab] = useState<Tab>('uploaded');

  const uploaded = useMemo(
    () => tutorials.filter((t) => t.creatorId === user?.uid),
    [tutorials, user],
  );

  const liked = useMemo(
    () =>
      tutorials.filter((t) => userProfile?.likedTutorials?.includes(t.tutorialId)),
    [tutorials, userProfile],
  );

  const history = useMemo(
    () =>
      tutorials.filter((t) => userProfile?.viewedTutorials?.includes(t.tutorialId)),
    [tutorials, userProfile],
  );

  const stats = [
    { icon: Upload, label: 'Published', value: uploaded.length },
    { icon: Heart, label: 'Likes Gained', value: uploaded.reduce((s, t) => s + (t.likesCount || 0), 0) },
    { icon: Eye, label: 'Total Views', value: userProfile?.viewedTutorials?.length || 0 },
    { icon: BookOpen, label: 'Liked', value: userProfile?.likedTutorials?.length || 0 },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'uploaded', label: 'Uploaded' },
    { key: 'liked', label: 'Liked' },
    { key: 'history', label: 'History' },
  ];

  const currentList = tab === 'uploaded' ? uploaded : tab === 'liked' ? liked : history;

  return (
    <ProtectedRoute>
      <Head>
        <title>Profile - L - Hub</title>
      </Head>

      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-accent/20">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-accent">
                {userProfile?.displayName?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
              {userProfile?.displayName || 'User'}
            </h1>
            <p className="text-text-secondary dark:text-text-secondary-dark">
              {userProfile?.email}
            </p>
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Joined {userProfile?.creationDate ? new Date(userProfile.creationDate).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 text-center"
            >
              <stat.icon size={20} className="mx-auto text-accent" />
              <p className="mt-2 text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {stat.value}
              </p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex gap-1 rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tab === t.key
                    ? 'bg-accent text-white'
                    : 'text-text-secondary dark:text-text-secondary-dark hover:bg-surface dark:hover:bg-surface-dark'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {currentList.length === 0 ? (
              <p className="py-8 text-center text-text-secondary dark:text-text-secondary-dark">
                No tutorials yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentList.map((t) => (
                  <TutorialCard key={t.tutorialId} tutorial={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
