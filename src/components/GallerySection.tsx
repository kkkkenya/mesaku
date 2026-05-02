import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { galleryImages, DRIVE_FOLDER_URL } from "@/data/gallery";

const GallerySection = () => {
  const { ref, inView } = useInView();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef(0);

  const closeLightbox = () => setLightboxIndex(null);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null)),
    [],
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % galleryImages.length : null)),
    [],
  );

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
    <section id="gallery" className="py-12 md:py-20 bg-white" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2
          className={`font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-12 ${inView ? "animate-fade-in-up" : "opacity-0"}`}
        >
          Gallery
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((img, i) => (
            <div
              key={img.name}
              className={`overflow-hidden rounded-lg cursor-pointer ${inView ? `animate-scale-in animation-delay-${((i % 6) + 1) * 100}` : "opacity-0"}`}
              onClick={() => setLightboxIndex(i)}
            >
              <img
                src={img.src}
                alt="MESA KU event photo - Mechanical Engineering Students Association Kenyatta University"
                className="w-full aspect-square object-cover hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-10">
          <Link
            to="/gallery"
            className="bg-[#1E3A8A] text-white px-6 h-12 inline-flex items-center rounded-lg text-base font-semibold hover:bg-[#15498f] transition-colors"
          >
            View All Photos
          </Link>
          <a
            href={DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-[1.5px] border-[#1E3A8A] text-[#1E3A8A] bg-white px-6 h-12 rounded-lg text-base font-medium hover:bg-[#1E3A8A]/5 transition-colors"
          >
            View on Google Drive <ExternalLink size={16} />
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
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 text-white z-10"
          >
            <X size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 text-white z-10 p-2"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 text-white z-10 p-2"
          >
            <ChevronRight size={32} />
          </button>
          <img
            src={galleryImages[lightboxIndex].src}
            alt="MESA KU event photo - Mechanical Engineering Students Association Kenyatta University"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default GallerySection;