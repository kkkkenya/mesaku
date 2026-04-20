import { useEffect, useRef, useState } from "react";
import { X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "newsletter_dismissed";

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "true") return;

    const t = setTimeout(() => {
      setOpen(true);
      // next tick for animation
      requestAnimationFrame(() => setVisible(true));
    }, 3000);

    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setTimeout(() => setOpen(false), 300);
  };

  // Esc key + focus trap
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // initial focus
    setTimeout(() => {
      (inputRef.current ?? closeBtnRef.current)?.focus();
    }, 50);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables).filter((el) => !el.hasAttribute("disabled"));
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        try {
          localStorage.setItem(STORAGE_KEY, "true");
        } catch {
          // ignore
        }
        setTimeout(() => close(), 2200);
      } else {
        setError((data as any)?.error || "Subscription failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300"
      style={{
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.55)",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        ref={cardRef}
        className="relative w-full bg-background text-foreground rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300"
        style={{
          maxWidth: 460,
          transform: visible ? "scale(1)" : "scale(0.95)",
          opacity: visible ? 1 : 0,
        }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={close}
          aria-label="Close newsletter popup"
          className="absolute top-3 right-3 inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle className="text-primary" size={44} />
            <h2 id="newsletter-popup-title" className="font-heading text-2xl font-bold">
              You're subscribed!
            </h2>
            <p className="text-sm text-muted-foreground">Welcome to the MESA-KU community.</p>
          </div>
        ) : (
          <>
            <h2
              id="newsletter-popup-title"
              className="font-heading text-2xl sm:text-3xl font-bold text-foreground pr-8"
            >
              Stay in the Loop
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Get the latest updates, events, and resources from MESA-KU delivered straight to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email address"
                disabled={loading}
                className="w-full h-12 px-4 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
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

              <div className="min-h-[20px]" aria-live="polite">
                {error && (
                  <p className="inline-flex items-center gap-1.5 text-destructive text-sm">
                    <AlertCircle size={14} />
                    {error}
                  </p>
                )}
              </div>
            </form>

            <p className="mt-2 text-xs text-muted-foreground text-center">
              No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterPopup;
