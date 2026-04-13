import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import { useInView } from "@/hooks/useInView";

const GallerySection = () => {
  const { ref, inView } = useInView();

  const images = [
    { src: gallery1, alt: "Students in library", className: "col-span-1 row-span-1" },
    { src: gallery2, alt: "Friends at sunset", className: "col-span-1 row-span-1" },
    { src: gallery3, alt: "Lecture hall", className: "col-span-1 row-span-1" },
    { src: gallery4, alt: "Community gathering", className: "col-span-2 row-span-1" },
    { src: gallery5, alt: "Students collaborating", className: "col-span-1 row-span-1" },
  ];

  return (
    <section id="gallery" className="py-20 bg-card" ref={ref}>
      <div className="container mx-auto px-6">
        <h2 className={`font-heading text-3xl md:text-4xl font-bold text-navy mb-12 ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
          Gallery
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className={`${img.className} overflow-hidden rounded-xl ${inView ? `animate-scale-in animation-delay-${(i + 1) * 100}` : "opacity-0"}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-48 md:h-56 object-cover hover:scale-110 transition-transform duration-700 cursor-pointer"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button className="border border-navy text-navy px-6 py-2 rounded-full text-sm font-medium hover:bg-navy hover:text-navy-foreground transition-colors duration-300">
            VIEW ALL →
          </button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
