import { useState, useEffect } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide((p) => (p + 1) % 3), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative h-[85vh] min-h-[600px] flex items-end overflow-hidden">
      <img
        src={heroBg}
        alt=""
        role="presentation"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
      />
      <div className="absolute inset-0 bg-accent/70" />
      
      <div className="relative z-10 container mx-auto px-6 pb-16">
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-primary-foreground font-bold leading-tight max-w-3xl animate-fade-in-up">
          Mechanical Engineering Students Association - Kenyatta University
        </h1>
        <p className="mt-4 text-primary-foreground/80 max-w-xl text-base md:text-lg leading-relaxed animate-fade-in-up animation-delay-200">
          MESA KU brings together mechanical engineering students at Kenyatta University through hands-on projects, industry workshops, engineering competitions, leadership development, and community events.
        </p>
        <button
          onClick={() => document.getElementById("events")?.scrollIntoView({ behavior: "smooth" })}
          className="mt-8 bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity animate-fade-in-up animation-delay-300"
        >
          Explore Events
        </button>

        <div className="flex gap-2 mt-8 animate-fade-in animation-delay-400">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSlide === i ? "bg-primary-foreground scale-110" : "bg-primary-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
