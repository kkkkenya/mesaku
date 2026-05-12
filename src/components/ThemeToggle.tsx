import { useEffect, useState } from "react";

// In-memory manual override (avoids localStorage in sandboxed envs)
let manualOverride: "light" | "dark" | null = null;
const listeners = new Set<(t: "light" | "dark") => void>();

const getSystemTheme = (): "light" | "dark" =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const applyTheme = (theme: "light" | "dark") => {
  document.documentElement.setAttribute("data-theme", theme);
  listeners.forEach((l) => l(theme));
};

let initialized = false;
const init = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Sync with OS changes when no manual override
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (manualOverride === null) applyTheme(getSystemTheme());
  };
  mql.addEventListener?.("change", onChange);

  // Enable smooth transitions after first paint (no flash on load)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.add("theme-ready"));
  });
};

interface Props {
  className?: string;
}

const ThemeToggle = ({ className = "" }: Props) => {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined"
      ? ((document.documentElement.getAttribute("data-theme") as
          | "light"
          | "dark") ?? "light")
      : "light",
  );

  useEffect(() => {
    init();
    const sub = (t: "light" | "dark") => setTheme(t);
    listeners.add(sub);
    return () => {
      listeners.delete(sub);
    };
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    manualOverride = next;
    applyTheme(next);
  };

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-full border border-transparent text-current hover:border-[color:var(--color-border)] transition-colors ${className}`}
    >
      <span
        className="relative block h-[18px] w-[18px]"
        style={{ transition: "transform 300ms ease" }}
      >
        {/* Sun (shown in dark mode) */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0) scale(1)" : "rotate(-90deg) scale(0.6)",
            transition: "opacity 250ms ease, transform 300ms ease",
          }}
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        {/* Moon (shown in light mode) */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(90deg) scale(0.6)" : "rotate(0) scale(1)",
            transition: "opacity 250ms ease, transform 300ms ease",
          }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggle;
