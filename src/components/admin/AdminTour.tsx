import { useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "mesa_admin_tour_complete";

type Step = {
  selector: string | null; // null = centered final modal
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="sidebar"]',
    title: "Welcome to MESA-KU Admin",
    body: "👋 Use this sidebar to manage Events, Merchandise, Announcements, and the Newsletter.",
  },
  {
    selector: '[data-tour="nav-events"]',
    title: "Events",
    body: "📅 Create and manage MESA events here. Set dates, descriptions, and publish or unpublish them at any time.",
  },
  {
    selector: '[data-tour="nav-merchandise"]',
    title: "Merchandise",
    body: "🛍️ Add and manage MESA branded items. Set prices, stock status, and product images.",
  },
  {
    selector: '[data-tour="nav-announcements"]',
    title: "Announcements",
    body: "📢 Post updates and news for MESA members. Use tags to categorize and set a publish date.",
  },
  {
    selector: '[data-tour="nav-newsletter"]',
    title: "Newsletter",
    body: "✉️ View subscribers and send email campaigns through Mailchimp. Always send a test email before broadcasting!",
  },
  {
    selector: null,
    title: "✅ You're all set!",
    body: "You now know your way around the MESA-KU Admin Panel. Go ahead and explore.",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

type Rect = { top: number; left: number; width: number; height: number };

export default function AdminTour({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const current = STEPS[step];
  const isFinal = current?.selector === null;

  useLayoutEffect(() => {
    if (!open) return;
    setAnimKey((k) => k + 1);

    if (isFinal) {
      setRect(null);
      return;
    }

    const measure = () => {
      const el = current?.selector
        ? (document.querySelector(current.selector) as HTMLElement | null)
        : null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const id = setInterval(measure, 250); // re-measure if drawer animates in
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      clearInterval(id);
    };
  }, [open, step, current, isFinal]);

  if (!open) return null;

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onClose();
  };
  const next = () => {
    if (step >= STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  };

  // Tooltip placement
  const PADDING = 12;
  const TOOLTIP_W = 300;
  let tipStyle: React.CSSProperties = {};
  if (isFinal || !rect) {
    tipStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  } else {
    const vw = window.innerWidth;
    const placeRight = rect.left + rect.width + PADDING + TOOLTIP_W < vw - 16;
    if (placeRight) {
      tipStyle = {
        top: Math.max(16, rect.top),
        left: rect.left + rect.width + PADDING,
      };
    } else {
      // place below
      tipStyle = {
        top: rect.top + rect.height + PADDING,
        left: Math.min(Math.max(16, rect.left), vw - TOOLTIP_W - 16),
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Spotlight overlay using SVG mask */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onClick={() => {}}
        style={{ pointerEvents: "auto" }}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && !isFinal && (
              <rect
                x={rect.left - 6}
                y={rect.top - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15,23,42,0.72)"
          mask="url(#tour-mask)"
        />
        {rect && !isFinal && (
          <rect
            x={rect.left - 6}
            y={rect.top - 6}
            width={rect.width + 12}
            height={rect.height + 12}
            rx="10"
            fill="none"
            stroke="hsl(var(--teal))"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Tooltip card */}
      <div
        key={animKey}
        className="absolute pointer-events-auto w-[300px] rounded-xl bg-white shadow-lg p-5 animate-tour-in"
        style={tipStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        <p className="text-xs font-semibold text-teal mb-2">
          {isFinal ? "Tour complete" : `Step ${step + 1} of ${STEPS.length - 1}`}
        </p>
        <h3 id="tour-title" className="font-bold text-slate-900 text-base mb-1">
          {current.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">{current.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          {!isFinal ? (
            <>
              <button
                type="button"
                onClick={finish}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Skip tour
              </button>
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-1 h-9 px-4 rounded-lg bg-teal text-teal-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Next →
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="ml-auto inline-flex items-center gap-1 h-10 px-5 rounded-lg bg-teal text-teal-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Let's Go →
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes tour-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-tour-in { animation: tour-in 0.28s ease-out both; }
      `}</style>
    </div>
  );
}

export function shouldShowTour() {
  return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) !== "true";
}

export function resetTour() {
  localStorage.removeItem(STORAGE_KEY);
}
