import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface MediaPlayerProps {
  mediaType: 'video' | 'image';
  mediaUrl: string;
  title: string;
  imageUrls?: string[];
  autoplay?: boolean;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function MediaPlayer({ mediaType, mediaUrl, title, imageUrls, autoplay = false }: MediaPlayerProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const youtubeId = mediaUrl ? getYouTubeId(mediaUrl) : null;
  const images = imageUrls || (mediaType === 'image' ? [mediaUrl] : []);

  if (youtubeId) {
    return (
      <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&rel=0`}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (mediaType === 'video') {
    return (
      <div className="overflow-hidden rounded-2xl bg-black shadow-xl">
        <video
          src={mediaUrl}
          controls
          className="w-full aspect-video"
          poster={undefined}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => setLightboxOpen(true)}
        className="cursor-pointer overflow-hidden rounded-2xl bg-card dark:bg-card-dark shadow-xl"
      >
        <img
          src={images[0]}
          alt={title}
          className="w-full aspect-video object-cover transition duration-300 hover:scale-105"
        />
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
          >
            <X size={24} />
          </button>

          <div className="relative flex max-h-[90vh] max-w-[90vw] items-center">
            {images.length > 1 && (
              <button
                onClick={() => setCurrentIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute -left-12 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <img
              src={images[currentIdx]}
              alt={`${title} - ${currentIdx + 1}`}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />

            {images.length > 1 && (
              <button
                onClick={() => setCurrentIdx((i) => (i + 1) % images.length)}
                className="absolute -right-12 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-2 w-2 rounded-full transition ${
                    i === currentIdx ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
