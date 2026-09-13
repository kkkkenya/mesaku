import { useEffect, useRef, useState } from "react";
import { X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mesaLogo from "@/assets/mesa-logo.png";

const COOKIE_DISMISSED = "mesa_popup_dismissed";
const COOKIE_SUBSCRIBED = "mesa_popup_subscribed";

// Palette — measured against WCAG AA:
//   ink #12203A on paper        16.2:1   secondary #44536B on paper 7.8:1
//   muted #64748B on paper       4.8:1   error #B42318 on paper    6.6:1
//   white on navy #0F172A       17.9:1   white/65 on navy          ~8:1
//   brass #D4A017 on navy        7.5:1   white on CTA #2563EB      4.5:1
const INK = "#12203A";
const INK_SECONDARY = "#44536B";
const NAVY = "#0F172A";

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

type Notice = { kind: "error" | "info"; msg: string } | null;

type SubscribeResponse = { success?: boolean; error?: string };

const isAlreadySubscribed = (msg: string) =>
  msg.includes("already") ||
  msg.includes("exist") ||
  msg.includes("duplicate") ||
  msg.includes("member exists");

const NewsletterPopup = () => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const touchStartY = useRef(0);

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

  // Esc + focus trap + body lock. The input takes focus on desktop only —
  // on mobile the sheet sits at the bottom edge and an auto-opened keyboard
  // would cover it.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (!isMobile) {
      setTimeout(() => {
        (inputRef.current ?? closeBtnRef.current)?.focus();
      }, 60);
    }

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
      setNotice({ kind: "error", msg: "Please enter a valid email address." });
      return;
    }
    setNotice(null);
    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke<
        SubscribeResponse | null
      >("subscribe-mailchimp", { body: { email } });
      if (fnError) {
        let serverMsg = "";
        try {
          const ctx = (fnError as { context?: Response }).context;
          if (ctx) {
            const json = (await ctx.json()) as { error?: string };
            serverMsg = json?.error || "";
          }
        } catch {
          // ignore
        }
        const msg = (serverMsg || fnError.message || "").toLowerCase();
        setNotice(
          isAlreadySubscribed(msg)
            ? { kind: "info", msg: "You're already on the list." }
            : {
                kind: "error",
                msg: serverMsg || fnError.message || "Subscription failed. Please try again.",
              },
        );
        setLoading(false);
        return;
      }
      if (data?.success) {
        setSubmitted(true);
        setCookie(COOKIE_SUBSCRIBED, "true", 365);
        setTimeout(() => close(false), 6000);
      } else {
        const msg = (data?.error || "").toLowerCase();
        setNotice(
          isAlreadySubscribed(msg)
            ? { kind: "info", msg: "You're already on the list." }
            : {
                kind: "error",
                msg: data?.error || "Subscription failed. Please try again.",
              },
        );
      }
    } catch {
      setNotice({ kind: "error", msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Swipe-to-dismiss on mobile — drag the navy header strip downward.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) setDragOffset(dy);
  };
  const onTouchEnd = () => {
    if (dragOffset !== null && dragOffset > 110) {
      setDragOffset(0);
      close();
    } else {
      setDragOffset(null);
    }
  };

  if (!open) return null;

  const reduced = prefersReducedMotion();

  // Backdrop
  const backdropStyle: React.CSSProperties = {
    backgroundColor: "rgba(2, 6, 23, 0.55)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    opacity: reduced ? 1 : visible ? 1 : 0,
    transition: reduced ? undefined : "opacity 300ms ease",
  };

  // Card animation — drag follows the finger on mobile, no transition then
  const cardEase = "cubic-bezier(0.16, 1, 0.3, 1)";
  const dragging = dragOffset !== null && dragOffset > 0;
  const cardStyle: React.CSSProperties = isMobile
    ? {
        transform: visible
          ? `translateY(${dragOffset ?? 0}px)`
          : "translateY(100%)",
        opacity: reduced || dragging ? 1 : visible ? 1 : 0,
        transition:
          reduced || dragging
            ? undefined
            : `transform 350ms ${cardEase}, opacity 300ms ease`,
        maxHeight: "85dvh",
      }
    : {
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: reduced ? 1 : visible ? 1 : 0,
        transition: reduced ? undefined : `transform 350ms ${cardEase}, opacity 350ms ease`,
      };

  const eyebrow = (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A6A14]">
      Newsletter
    </p>
  );

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
        className={`relative flex w-full overflow-hidden bg-white shadow-2xl ${
          isMobile
            ? "max-w-md flex-col rounded-t-2xl"
            : "max-w-2xl rounded-2xl"
        }`}
        style={cardStyle}
      >
        {/* ── Desktop drafting-sheet panel ── */}
        {!isMobile && (
          <div
            className="relative flex w-[240px] lg:w-[270px] shrink-0 flex-col items-center justify-center overflow-hidden px-7 py-10"
            style={{ backgroundColor: NAVY }}
          >
            {/* Blueprint grid — MESA's drafting motif */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                maskImage:
                  "radial-gradient(circle at center, black 30%, transparent 78%)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, black 30%, transparent 78%)",
              }}
            />
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/15 bg-white/5">
                <img
                  src={mesaLogo}
                  alt=""
                  className="h-14 w-14 object-contain"
                />
              </div>
              <p className="mt-5 font-heading text-xl font-semibold text-white">
                MESA KU
              </p>
              {/* Title block, like an engineering drawing */}
              <div className="mt-4 w-full border-t border-white/15 pt-4">
                <p className="text-[11px] font-medium uppercase leading-relaxed tracking-[0.18em] text-white/65">
                  Mechanical Engineering
                  <br />
                  Students Association
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4A017]">
                  Kenyatta University
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Form panel ── */}
        <div
          className={`flex flex-1 flex-col justify-center ${
            isMobile
              ? "p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              : "p-7 sm:p-8 md:p-9"
          }`}
        >
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="text-primary" size={30} />
              </div>
              <h2
                id="newsletter-popup-title"
                className="font-heading text-2xl font-bold"
                style={{ color: INK }}
              >
                You're in.
              </h2>
              <p className="text-sm" style={{ color: INK_SECONDARY }}>
                We'll keep you updated at {email}.
              </p>
              <button
                type="button"
                onClick={() => close(false)}
                className="mt-2 h-11 rounded-md bg-primary px-10 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {isMobile && (
                <>
                  {/* Draggable navy strip — grabber is real: drag down to dismiss */}
                  <div
                    ref={stripRef}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    className="relative -mx-5 -mt-5 mb-5 cursor-grab px-5 pb-4 pt-2.5 active:cursor-grabbing"
                    style={{ backgroundColor: NAVY, touchAction: "none" }}
                  >
                    <span
                      aria-hidden
                      className="mx-auto block h-1.5 w-10 rounded-full bg-white/30"
                    />
                    <div className="mt-3.5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                        <img
                          src={mesaLogo}
                          alt=""
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-heading text-base font-semibold leading-tight text-white">
                          MESA KU
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4A017]">
                          Newsletter
                        </p>
                      </div>
                    </div>
                  </div>
                  <h2
                    id="newsletter-popup-title"
                    className="font-heading text-[26px] font-bold leading-snug"
                    style={{ color: INK }}
                  >
                    Never miss what we build next.
                  </h2>
                </>
              )}

              {!isMobile && (
                <>
                  <div className="flex items-center justify-between gap-4">
                    {eyebrow}
                    <span className="h-px flex-1 bg-[#E2E8F0]" aria-hidden />
                  </div>
                  <h2
                    id="newsletter-popup-title"
                    className="mt-3 font-heading text-3xl font-bold leading-tight"
                    style={{ color: INK }}
                  >
                    Never miss what we build next.
                  </h2>
                </>
              )}

              <p
                className={`font-heading italic leading-relaxed ${
                  isMobile ? "mt-2 text-[15px]" : "mt-3 text-base"
                }`}
                style={{ color: INK_SECONDARY }}
              >
                Events, workshops, competitions, and opportunities — about
                twice a month, straight to your inbox.
              </p>

              <form noValidate onSubmit={handleSubmit} className={isMobile ? "mt-5 space-y-3" : "mt-6 space-y-3"}>
                <input
                  ref={inputRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setNotice(null);
                  }}
                  placeholder="Your email address"
                  disabled={loading}
                  className="h-12 w-full rounded-md border border-[#7C8AA0] bg-white px-4 text-base transition-colors placeholder:text-[#64748B] focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/25 disabled:opacity-60"
                  style={{ color: INK }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40 disabled:cursor-not-allowed disabled:opacity-70"
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

                <div className="min-h-[22px]" aria-live="polite">
                  {notice && (
                    <p
                      className={`inline-flex items-center gap-1.5 text-sm ${
                        notice.kind === "error" ? "text-[#B42318]" : "text-[#1E3A8A]"
                      }`}
                    >
                      {notice.kind === "error" ? (
                        <AlertCircle size={14} />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      {notice.msg}
                    </p>
                  )}
                </div>
              </form>

              <p className="mt-1 text-xs" style={{ color: "#64748B" }}>
                No spam. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>

        {/* ── Close ── */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={() => close()}
          aria-label="Close newsletter popup"
          className={`absolute right-2 top-2 inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 ${
            isMobile
              ? "h-11 w-11 text-white/70 hover:bg-white/10 focus-visible:ring-[#D4A017]"
              : "right-3 top-3 h-9 w-9 text-[#44536B] hover:bg-slate-100 focus-visible:ring-[#1E3A8A]/40"
          }`}
        >
          <X size={isMobile ? 20 : 18} />
        </button>
      </div>
    </div>
  );
};

export default NewsletterPopup;
