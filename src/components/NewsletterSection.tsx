import { useState } from "react";
import { CheckCircle } from "lucide-react";
import newsletterBg from "@/assets/newsletter-bg.jpg";
import { useInView } from "@/hooks/useInView";

const NewsletterSection = () => {
  const { ref, inView } = useInView();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <section id="newsletter" className="relative py-16 md:py-24 overflow-hidden" ref={ref}>
      <img
        src={newsletterBg}
        alt="Students on campus"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-accent/80" />

      <div className={`relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center ${inView ? "animate-fade-in-up" : "opacity-0"}`}>
        {submitted ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-green-400" />
            <p className="text-primary-foreground text-base">You're in! We'll be in touch at {email}</p>
          </div>
        ) : (
          <>
            <p className="uppercase tracking-[4px] text-primary-foreground/70 text-xs font-semibold mb-3">Newsletter</p>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Stay Updated with MESA
            </h2>
            <p className="font-heading italic text-primary-foreground/80 max-w-lg mx-auto mb-8 text-base">
              "Never miss an update! Subscribe to our newsletter and get the latest news on events, workshops, and opportunities directly in your inbox."
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="flex-1 px-4 h-12 rounded-md bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary transition-colors text-base"
              />
              <button
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground px-6 h-12 rounded-md font-semibold text-base hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
