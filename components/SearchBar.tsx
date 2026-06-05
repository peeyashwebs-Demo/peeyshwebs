import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  mediaType: string;
  onMediaTypeChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
}

const CATEGORIES = [
  'All',
  'Design',
  'Development',
  'Photography',
  'Music',
  'Cooking',
  'Fitness',
  'Technology',
  'Art',
  'Science',
  'Business',
  'Other',
];

export default function SearchBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  mediaType,
  onMediaTypeChange,
  sortBy,
  onSortByChange,
}: SearchBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary dark:text-text-secondary-dark"
        />
        <input
          type="text"
          placeholder="Search tutorials..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark py-3 pl-10 pr-4 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark outline-none focus:border-accent transition"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark">
          <SlidersHorizontal size={16} />
          <span className="font-medium">Filters</span>
        </div>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-1.5 text-sm text-text-primary dark:text-text-primary-dark outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c === 'All' ? '' : c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={mediaType}
          onChange={(e) => onMediaTypeChange(e.target.value)}
          className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-1.5 text-sm text-text-primary dark:text-text-primary-dark outline-none"
        >
          <option value="">All Types</option>
          <option value="video">Video</option>
          <option value="image">Images</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-1.5 text-sm text-text-primary dark:text-text-primary-dark outline-none"
        >
          <option value="new">Newest</option>
          <option value="trending">Trending</option>
          <option value="rated">Top Rated</option>
        </select>
      </div>
    </div>
  );
}
