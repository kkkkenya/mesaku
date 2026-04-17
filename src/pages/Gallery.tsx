import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { galleryImages, DRIVE_FOLDER_URL } from "@/data/gallery";

const Gallery = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const touchStartX = useRef(0);

  const closeLightbox = () => setLightboxIndex(null);
  const prev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null,
      ),
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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#1E3A8A] text-sm hover:underline mb-6"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <h1 className="text-center text-3xl md:text-4xl font-bold text-[#1E3A8A]">Gallery</h1>
          <p className="text-center text-gray-500 mt-2 mb-10">
            Moments from MESA KU events and activities
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map((img, i) => (
              <div
                key={img.name}
                className="overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={img.src}
                  alt={img.name}
                  className="w-full aspect-square object-cover hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

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
      </main>
      <Footer />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 text-white z-10"
          >
            <X size={28} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 text-white z-10 p-2"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 text-white z-10 p-2"
          >
            <ChevronRight size={32} />
          </button>
          <img
            src={galleryImages[lightboxIndex].src}
            alt={galleryImages[lightboxIndex].name}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
