import { useEffect, useRef } from "react";
import { X, ExternalLink, Download, CalendarDays } from "lucide-react";

type CalEvent = {
  title: string;
  description?: string | null;
  venue?: string | null;
  event_date: string; // ISO
  end_date?: string | null;
};

interface Props {
  event: CalEvent | null;
  onClose: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toICSDate = (iso: string) => {
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
};

const CalendarOptionsSheet = ({ event, onClose }: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!event) return;
    triggerRef.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && sheetRef.current) {
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    // Focus first action
    setTimeout(() => {
      sheetRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [event, onClose]);

  if (!event) return null;

  const start = new Date(event.event_date);
  const end = event.end_date
    ? new Date(event.end_date)
    : new Date(start.getTime() + 60 * 60 * 1000);

  const gStart = toICSDate(start.toISOString());
  const gEnd = toICSDate(end.toISOString());
  const title = encodeURIComponent(event.title);
  const desc = encodeURIComponent(event.description || "");
  const loc = encodeURIComponent(event.venue || "");

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${gStart}/${gEnd}&details=${desc}&location=${loc}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&body=${desc}&location=${loc}&startdt=${start.toISOString()}&enddt=${end.toISOString()}`;

  const downloadIcs = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MESA KU//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@mesa.co.ke`,
      `DTSTAMP:${toICSDate(new Date().toISOString())}`,
      `DTSTART:${gStart}`,
      `DTEND:${gEnd}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
      `LOCATION:${event.venue || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const optionCls =
    "flex items-center justify-between gap-3 w-full min-h-[56px] px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-[#1E3A8A]/30 transition-colors text-left";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cal-sheet-title"
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
              Add to calendar
            </p>
            <h3
              id="cal-sheet-title"
              className="font-heading text-base font-bold text-[#1E3A8A] truncate"
            >
              {event.title}
            </h3>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-11 w-11 -mr-2 inline-flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={optionCls}
            onClick={onClose}
          >
            <span className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] inline-flex items-center justify-center">
                <CalendarDays size={18} />
              </span>
              <span className="font-medium text-gray-900">Google Calendar</span>
            </span>
            <ExternalLink size={16} className="text-gray-400" aria-label="Opens in new tab" />
          </a>

          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={optionCls}
            onClick={onClose}
          >
            <span className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] inline-flex items-center justify-center">
                <CalendarDays size={18} />
              </span>
              <span className="font-medium text-gray-900">Outlook</span>
            </span>
            <ExternalLink size={16} className="text-gray-400" aria-label="Opens in new tab" />
          </a>

          <button
            type="button"
            onClick={() => {
              downloadIcs();
              onClose();
            }}
            className={optionCls}
          >
            <span className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-[#D4A017]/15 text-[#D4A017] inline-flex items-center justify-center">
                <Download size={18} />
              </span>
              <span className="font-medium text-gray-900">Apple / Download .ics</span>
            </span>
            <span className="text-xs text-gray-400">File</span>
          </button>
        </div>

        <div className="px-5 pb-5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarOptionsSheet;
