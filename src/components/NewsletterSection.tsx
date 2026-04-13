import newsletterBg from "@/assets/newsletter-bg.jpg";
import { useInView } from "@/hooks/useInView";

const NewsletterSection = () => {
  const { ref, inView } = useInView();

  return (
    <section className="relative py-24 overflow-hidden" ref={ref}>
      <img
        src={newsletterBg}
        alt="Students"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-accent/80" />

      <div className={`relative z-10 container mx-auto px-6 text-center ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
        <p className="uppercase tracking-[4px] text-primary-foreground/70 text-xs font-semibold mb-3">Newsletter</p>
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
          Stay Updated with ISS
        </h2>
        <p className="font-heading italic text-primary-foreground/80 max-w-lg mx-auto mb-8 text-sm md:text-base">
          "Never miss an update! Subscribe to our newsletter and get the latest news on events, activities, and opportunities directly in your inbox."
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Email"
            className="flex-1 px-4 py-3 rounded-md bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary transition-colors"
          />
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
