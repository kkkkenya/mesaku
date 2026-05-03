import { useEffect, useLayoutEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";


const STORAGE_KEY = "mesa_admin_tour_complete";

type Step = {
  selector: string | null;
  title: string;
  body: string;
  tip: string | null;
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="sidebar"]',
    title: "Welcome to the MESA KU Admin Panel",
    body: "This is your control centre. Everything on the public website — events, merchandise, announcements, and the newsletter — is managed from this sidebar. You'll spend most of your time here.",
    tip: "Changes you make here are reflected on the live site at mesa.co.ke immediately after saving.",
  },
  {
    selector: '[data-tour="nav-events"]',
    title: "Managing Events",
    body: "Create, edit, and publish MESA KU events here. Each event has a title, description, date, time, location, cover photo, and a Google Form URL for RSVPs. Unpublished events are saved as drafts and won't appear on the public site.",
    tip: "Always set the correct date and time — the public site uses these to generate the 'Add to Google Calendar' link automatically.",
  },
  {
    selector: '[data-tour="nav-merchandise"]',
    title: "Managing Merchandise",
    body: "Add and manage MESA KU branded items. Each product has a name, price (KSh), description, available sizes, and a product image. Orders are handled via WhatsApp — the site pre-fills the message automatically using the product name and size the customer selects.",
    tip: "Upload a real product photo as soon as one is available. The placeholder improves significantly with an actual image.",
  },
  {
    selector: '[data-tour="nav-announcements"]',
    title: "Posting Announcements",
    body: "Post news, updates, and notices for MESA KU members. Each announcement has a title, description, tag (Announcement / Event / News / Update), and a date. Use the Published toggle to control what appears on the homepage.",
    tip: "The homepage only shows the 3 most recent published announcements. Older ones are visible on the full /announcements page.",
  },
  {
    selector: '[data-tour="nav-newsletter"]',
    title: "Newsletter & Subscribers",
    body: "View everyone who has subscribed via the homepage newsletter form. From here you can see subscriber emails and send campaign updates. If Mailchimp is connected, you can broadcast directly — always send yourself a test email first.",
    tip: "Subscribers signed up to hear from MESA KU specifically. Keep emails relevant — events, announcements, and opportunities only.",
  },
  {
    selector: null,
    title: "You're ready to go.",
    body: null,
    tip: null,
  },
];

const FINAL_QUICK_REF = [
  { icon: "📅", label: "Events", desc: "Create & publish events" },
  { icon: "🛍️", label: "Merch", desc: "Manage products & prices" },
  { icon: "📢", label: "Announcements", desc: "Post news & updates" },
  { icon: "✉️", label: "Newsletter", desc: "View subscribers & send" },
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
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  useEffect(() => {
    if (open) { setStep(0); setDirection("forward"); }
  }, [open]);

  const current = STEPS[step];
  const isFinal = current?.selector === null;
  const isFirst = step === 0;
  const totalSteps = STEPS.length - 1; // exclude final screen

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft" && !isFirst) handleBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, step, isFirst]);

  useLayoutEffect(() => {
    if (!open) return;
    setAnimKey((k) => k + 1);
    if (isFinal) { setRect(null); return; }
    const measure = () => {
      const el = current?.selector
        ? (document.querySelector(current.selector) as HTMLElement | null)
        : null;
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const id = setInterval(measure, 250);
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

  const handleNext = () => {
    setDirection("forward");
    if (step >= STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    setDirection("back");
    setStep((s) => s - 1);
  };

  // Tooltip placement
  const PADDING = 16;
  const TOOLTIP_W = 320;
  let tipStyle: React.CSSProperties = {};
  if (isFinal || !rect) {
    tipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  } else {
    const vw = window.innerWidth;
    const placeRight = rect.left + rect.width + PADDING + TOOLTIP_W < vw - 16;
    if (placeRight) {
      tipStyle = {
        top: Math.max(16, rect.top),
        left: rect.left + rect.width + PADDING,
      };
    } else {
      tipStyle = {
        top: rect.top + rect.height + PADDING,
        left: Math.min(Math.max(16, rect.left), vw - TOOLTIP_W - 16),
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Spotlight overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "auto" }}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && !isFinal && (
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10,18,36,0.78)"
          mask="url(#tour-mask)"
        />
        {rect && !isFinal && (
          <rect
            x={rect.left - 8}
            y={rect.top - 8}
            width={rect.width + 16}
            height={rect.height + 16}
            rx="10"
            fill="none"
            stroke="#D4A017"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
        )}
      </svg>

      {/* Tooltip card */}
      <div
        key={`${animKey}-${direction}`}
        className="absolute pointer-events-auto rounded-xl bg-white shadow-2xl animate-tour-in"
        style={{ ...tipStyle, width: TOOLTIP_W }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        {!isFinal ? (
          <>
            {/* Header bar */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#D4A017]">
                  MESA KU Admin Tour
                </span>
                <button
                  type="button"
                  onClick={finish}
                  className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Skip tour ×
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: i === step ? 20 : 6,
                      background: i < step ? "#1E3A8A" : i === step ? "#D4A017" : "#e2e8f0",
                    }}
                  />
                ))}
                <span className="ml-auto text-[11px] text-slate-400 font-medium">
                  {step + 1} / {totalSteps}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <h3
                id="tour-title"
                className="font-bold text-slate-900 text-[15px] mb-2 leading-snug"
              >
                {current.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {current.body}
              </p>

              {current.tip && (
                <div className="mt-3 flex gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                  <span className="text-base leading-none mt-0.5">💡</span>
                  <p className="text-xs text-amber-800 leading-relaxed">{current.tip}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={isFirst}
                className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-9 px-5 rounded-lg text-sm font-semibold transition-opacity"
                style={{ background: "#1E3A8A", color: "white" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#D4A017")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1E3A8A")}
              >
                {step === totalSteps - 1 ? "Finish tour →" : "Next →"}
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-[10px] text-slate-300 pb-2">
              ← → arrow keys to navigate · Esc to skip
            </p>
          </>
        ) : (
          /* ── Final screen ── */
          <>
            <div className="px-5 pt-5 pb-4 text-center border-b border-slate-100">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                style={{ background: "#f0f9f4" }}
              >
                ✅
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                You're all set!
              </h3>
              <p className="text-sm text-slate-500">
                Here's a quick reference for everything you just learned.
              </p>
            </div>

            {/* Quick reference grid */}
            <div className="grid grid-cols-2 gap-2 p-4">
              {FINAL_QUICK_REF.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-100 p-3"
                  style={{ background: "#f8fafc" }}
                >
                  <div className="text-lg mb-1">{item.icon}</div>
                  <p className="text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={finish}
                className="w-full h-10 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "#1E3A8A" }}
              >
                Go to dashboard →
              </button>
              <button
                type="button"
                onClick={() => { setStep(0); setDirection("forward"); }}
                className="w-full h-8 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
              >
                Replay tour from the start
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes tour-in {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-tour-in { animation: tour-in 0.22s ease-out both; }
      `}</style>
    </div>
  );
}

export function shouldShowTour() {
  return typeof window !== "undefined" &&
    localStorage.getItem(STORAGE_KEY) !== "true";
}

export function resetTour() {
  localStorage.removeItem(STORAGE_KEY);
}
