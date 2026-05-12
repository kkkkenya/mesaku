import { useEffect, useRef, useState } from "react";
import { X, CheckCircle, Loader2, AlertCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mesaLogo from "@/assets/mesa-logo.png";

const COOKIE_DISMISSED = "mesa_popup_dismissed";
const COOKIE_SUBSCRIBED = "mesa_popup_subscribed";

const setCookie = (name: string, value: string, days: number) => {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Track viewport for mobile threshold + bottom-sheet rendering
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Trigger logic
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getCookie(COOKIE_SUBSCRIBED) === "true") return;
    if (getCookie(COOKIE_DISMISSED) === "true") return;

    let timeReady = false;
    let scrollReady = false;
    let shown = false;

    const tryShow = () => {
      if (shown) return;
      if (!timeReady || !scrollReady) return;
      // Don't show if newsletter section is in viewport
      const section = document.getElementById("newsletter");
      if (section) {
        const rect = section.getBoundingClientRect();
        const inView =
          rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) return;
      }
      shown = true;
      setOpen(true);
      const reduced = prefersReducedMotion();
      if (reduced) setVisible(true);
      else requestAnimationFrame(() => setVisible(true));
    };

    const timer = setTimeout(() => {
      timeReady = true;
      tryShow();
    }, 10000);

    const onScroll = () => {
      const threshold = window.innerWidth < 768 ? 0.5 : 0.4;
      const scrolled =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight;
      const pct =
        document.documentElement.scrollHeight <= window.innerHeight
          ? 1
          : window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight);
      if (pct >= threshold || scrolled >= threshold + 0.1) {
        scrollReady = true;
        tryShow();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const close = (markDismissed = true) => {
    const reduced = prefersReducedMotion();
    setVisible(false);
    if (markDismissed && !submitted) {
      setCookie(COOKIE_DISMISSED, "true", 7);
    }
    setTimeout(() => setOpen(false), reduced ? 0 : 350);
  };

  // Esc + focus trap + body lock
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      (inputRef.current ?? closeBtnRef.current)?.focus();
    }, 60);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const list = Array.from(focusables).filter(
          (el) => !el.hasAttribute("disabled"),
        );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const { data, error: fnError } = await supabase.functions.invoke(
        "subscribe-mailchimp",
        { body: { email } },
      );
      if (fnError) {
        const ctx: any = (fnError as any).context;
        let serverMsg = "";
        try {
          const json = await ctx?.json?.();
          serverMsg = json?.error || "";
        } catch {
          // ignore
        }
        const msg = (serverMsg || fnError.message || "").toLowerCase();
        if (msg.includes("already") || msg.includes("exist") || msg.includes("duplicate") || msg.includes("member exists")) {
          setError("Looks like you're already subscribed! 🎉");
        } else {
          setError(serverMsg || fnError.message || "Subscription failed. Please try again.");
        }
        setLoading(false);
        return;
      }
      if ((data as any)?.success) {
        setSubmitted(true);
        setCookie(COOKIE_SUBSCRIBED, "true", 365);
        setTimeout(() => close(false), 3000);
      } else {
        const msg = ((data as any)?.error || "").toLowerCase();
        if (msg.includes("already") || msg.includes("exist") || msg.includes("member exists")) {
          setError("Looks like you're already subscribed! 🎉");
        } else {
          setError((data as any)?.error || "Subscription failed. Please try again.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const reduced = prefersReducedMotion();

  // Backdrop
  const backdropStyle: React.CSSProperties = {
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    opacity: reduced ? 1 : visible ? 1 : 0,
    transition: reduced ? undefined : "opacity 300ms ease",
  };

  // Card animation
  const cardEase = "cubic-bezier(0.16, 1, 0.3, 1)";
  const cardStyle: React.CSSProperties = isMobile
    ? {
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: reduced ? 1 : visible ? 1 : 0,
        transition: reduced ? undefined : `transform 350ms ${cardEase}, opacity 300ms ease`,
        maxHeight: "55vh",
      }
    : {
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: reduced ? 1 : visible ? 1 : 0,
        transition: reduced ? undefined : `transform 350ms ${cardEase}, opacity 350ms ease`,
      };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className={`fixed inset-0 flex ${
        isMobile ? "items-end" : "items-center"
      } justify-center ${isMobile ? "p-0" : "p-4"}`}
      style={{ zIndex: 9999, ...backdropStyle }}
    >
      <div
        ref={cardRef}
        className={`relative bg-[#0f172a] text-white shadow-2xl overflow-hidden border border-white/10 ${
          isMobile
            ? "w-full rounded-t-2xl"
            : "w-full max-w-3xl rounded-2xl"
        }`}
        style={cardStyle}
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex justify-center pt-2.5 pb-1">
            <span className="block h-1.5 w-12 rounded-full bg-white/25" />
          </div>
        )}

        {/* Close button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={() => close()}
          aria-label="Close newsletter popup"
          className="absolute top-3 right-3 z-20 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X size={18} />
        </button>

        <div className={`grid ${isMobile ? "grid-cols-1" : "md:grid-cols-2"}`}>
          {/* Left visual panel — desktop only */}
          {!isMobile && (
            <div
              className="relative hidden md:flex flex-col items-center justify-center p-8 overflow-hidden"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, hsl(var(--primary) / 0.35), transparent 60%), radial-gradient(circle at 70% 80%, #1e3a8a 0%, #0b1226 70%)",
              }}
            >
              {/* engineering grid */}
              <div
                className="absolute inset-0 opacity-[0.18] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                  maskImage:
                    "radial-gradient(circle at center, black 40%, transparent 75%)",
                }}
              />
              {/* Glow */}
              <div
                className="absolute -inset-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--primary) / 0.45) 0%, transparent 60%)",
                  animation: reduced ? undefined : "popupGlow 4s ease-in-out infinite",
                  filter: "blur(40px)",
                }}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="h-28 w-28 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center shadow-xl">
                  <img
                    src={mesaLogo}
                    alt="MESA KU logo"
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <p className="mt-6 font-heading text-xl font-semibold text-white">
                  MESA KU
                </p>
                <p className="mt-1 text-xs uppercase tracking-[3px] text-white/60">
                  Engineering Excellence
                </p>
                <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white/85">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  200+ Members
                </div>
              </div>
            </div>
          )}

          {/* Right form panel */}
          <div className="p-6 sm:p-8 md:p-10">
            {submitted ? (
              <div className="flex flex-col items-center text-center gap-3 py-6">
                <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center">
                  <CheckCircle className="text-primary" size={32} />
                </div>
                <h2
                  id="newsletter-popup-title"
                  className="font-heading text-2xl font-bold"
                >
                  You're in!
                </h2>
                <p className="text-sm text-white/70">
                  Welcome to the MESA KU community.
                </p>
              </div>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium border border-primary/30">
                  <Mail size={12} /> MESA KU Newsletter
                </span>
                <h2
                  id="newsletter-popup-title"
                  className="mt-3 font-heading text-2xl sm:text-3xl font-bold leading-tight text-white"
                >
                  Don't Miss What's Next
                </h2>
                <p className="mt-2 text-sm sm:text-[15px] text-white/70 leading-relaxed">
                  Get the latest MESA KU events, workshops, competitions, and
                  opportunities — straight to your inbox.
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
                    placeholder="Your university email"
                    disabled={loading}
                    className="w-full h-12 px-4 rounded-md bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors disabled:opacity-60"
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
                      <>Join the List →</>
                    )}
                  </button>

                  <div className="min-h-[20px]" aria-live="polite">
                    {error && (
                      <p className="inline-flex items-center gap-1.5 text-red-300 text-sm">
                        <AlertCircle size={14} />
                        {error}
                      </p>
                    )}
                  </div>
                </form>

                <p className="mt-2 text-[11px] text-white/45 text-center">
                  No spam. Unsubscribe anytime. ~2 emails/month.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popupGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default NewsletterPopup;
