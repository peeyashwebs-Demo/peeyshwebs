import { useState, useMemo } from 'react';
import Head from 'next/head';
import SearchBar from '@/components/SearchBar';
import TutorialCard from '@/components/TutorialCard';
import { useAuth } from '@/lib/context/AuthContext';
import { useAllTutorials } from '@/lib/hooks/useTutorials';
import { toggleLikeTutorial } from '@/lib/services/userService';

export default function Home() {
  const { tutorials } = useAllTutorials();
  const { user, userProfile } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [sortBy, setSortBy] = useState('new');

  const likedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (userProfile?.likedTutorials) {
      for (const id of userProfile.likedTutorials) {
        map[id] = true;
      }
    }
    return map;
  }, [userProfile?.likedTutorials]);

  const filtered = useMemo(() => {
    let list = [...tutorials];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    if (category) {
      list = list.filter((t) => t.category === category);
    }

    if (mediaType) {
      list = list.filter((t) => t.mediaType === mediaType);
    }

    if (sortBy === 'new') {
      list.sort((a, b) => b.creationDate - a.creationDate);
    } else {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }

    return list;
  }, [tutorials, search, category, mediaType, sortBy]);

  const handleLikeChange = async (tutorialId: string, newLiked: boolean) => {
    if (!user) return;
    try {
      await toggleLikeTutorial(user.uid, tutorialId, !newLiked);
    } catch {
      // silent
    }
  };

  return (
    <>
      <Head>
        <title>L - Hub | Discover Tutorials</title>
        <meta name="description" content="Discover concise, media-rich tutorials" />
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Discover
          </h1>
          <p className="mt-1 text-text-secondary dark:text-text-secondary-dark">
            Explore tutorials created by the community
          </p>
        </div>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          mediaType={mediaType}
          onMediaTypeChange={setMediaType}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark">
              No tutorials found
            </p>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tutorial) => (
              <TutorialCard
                key={tutorial.tutorialId}
                tutorial={tutorial}
                liked={likedMap[tutorial.tutorialId] || false}
                onLikeChange={handleLikeChange}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}