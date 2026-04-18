import { useState } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import newsletterBg from "@/assets/newsletter-bg.jpg";
import { useInView } from "@/hooks/useInView";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSection = () => {
  const { ref, inView } = useInView();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("subscribe-mailchimp", {
        body: { email },
      });

      if (fnError) {
        const ctx: any = (fnError as any).context;
        let serverMsg = "";
        try {
          const json = await ctx?.json?.();
          serverMsg = json?.error || "";
        } catch {
          // ignore
        }
        setError(serverMsg || fnError.message || "Subscription failed. Please try again.");
        setLoading(false);
        return;
      }

      if ((data as any)?.success) {
        setSubmitted(true);
      } else {
        setError((data as any)?.error || "Subscription failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <CheckCircle size={48} color="#16a34a" />
            <p className="text-white text-2xl font-bold">You're subscribed! Welcome to the MESA KU community.</p>
            <p className="text-blue-100 text-base">We'll keep you updated at {email}</p>
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

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                disabled={loading}
                className="flex-1 px-4 h-12 rounded-md bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary transition-colors text-base disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 h-12 rounded-md font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Subscribing…
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
            <div className="min-h-[24px] mt-3" aria-live="polite">
              {error && (
                <p className="inline-flex items-center gap-2 text-red-300 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
