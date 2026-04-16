import { useState, useEffect, useCallback, useRef } from "react";
import { ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1kb5b56PK2p6a61VGI4rAMU7G4KsH7y4u";

// TODO: Add VITE_DRIVE_API_KEY to .env for live data
const placeholderImages = [
  { id: "placeholder-1", name: "Gallery 1" },
  { id: "placeholder-2", name: "Gallery 2" },
  { id: "placeholder-3", name: "Gallery 3" },
  { id: "placeholder-4", name: "Gallery 4" },
  { id: "placeholder-5", name: "Gallery 5" },
  { id: "placeholder-6", name: "Gallery 6" },
];

const thumbnailUrl = (fileId: string) =>
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

const GallerySection = () => {
  const { ref, inView } = useInView();
  const [images, setImages] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    // Simulate loading / use placeholders until API key is configured
    const timer = setTimeout(() => {
      setImages(placeholderImages);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = useCallback(() => setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null)), [images.length]);
  const next = useCallback(() => setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null)), [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightboxIndex, prev, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  return (
    <section id="gallery" className="py-12 md:py-20 bg-card" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2 className={`font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-12 ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
          Gallery
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {images.map((img, i) => (
              <div
                key={img.id}
                className={`overflow-hidden rounded-lg cursor-pointer ${inView ? `animate-scale-in animation-delay-${((i % 6) + 1) * 100}` : "opacity-0"}`}
                onClick={() => openLightbox(i)}
              >
                <img
                  src={thumbnailUrl(img.id)}
                  alt={img.name}
                  className="w-full aspect-square object-cover hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement!.classList.add("bg-gray-200");
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <a
            href={DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-[1.5px] border-[#1E3A8A] text-[#1E3A8A] bg-white px-6 h-12 rounded-lg text-base font-medium hover:bg-[#1E3A8A]/5 transition-colors"
          >
            View All on Google Drive <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-4 right-4 text-white z-10">
            <X size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white z-10 p-2">
            <ChevronLeft size={32} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white z-10 p-2">
            <ChevronRight size={32} />
          </button>
          <img
            src={thumbnailUrl(images[lightboxIndex].id).replace("w400", "w1200")}
            alt={images[lightboxIndex].name}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default GallerySection;
