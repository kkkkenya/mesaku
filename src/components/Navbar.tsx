import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Info,
  CalendarDays,
  Image as ImageIcon,
  Megaphone,
  ShoppingBag,
  ArrowUpRight,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";
import mesaLogo from "@/assets/mesa-logo.png";
import ThemeToggle from "@/components/ThemeToggle";

type NavItem =
  | { label: string; type: "scroll"; targetId: string; path: string; icon: React.ComponentType<{ className?: string }> }
  | { label: string; type: "route"; to: string; icon: React.ComponentType<{ className?: string }> };

const navItems: NavItem[] = [
  { label: "Home", type: "route", to: "/", icon: Home },
  { label: "About", type: "scroll", targetId: "about", path: "/", icon: Info },
  { label: "Events", type: "route", to: "/events", icon: CalendarDays },
  { label: "Gallery", type: "route", to: "/gallery", icon: ImageIcon },
  { label: "Announcements", type: "route", to: "/announcements", icon: Megaphone },
  { label: "Merch", type: "scroll", targetId: "merchandise", path: "/", icon: ShoppingBag },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click outside (desktop pill only)
  useEffect(() => {
    if (!open) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Lock body scroll + Escape close on mobile drawer
  useEffect(() => {
    if (!open) return;
    if (window.innerWidth >= 768) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleScroll = (id: string, path: string) => {
    if (location.pathname !== path) {
      window.location.href = `${path}#${id}`;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  const isActive = (item: NavItem) => {
    if (item.type === "route") {
      if (item.to === "/") return location.pathname === "/";
      return location.pathname.startsWith(item.to);
    }
    return false;
  };

  // ===== DESKTOP =====
  const renderDesktopLink = (item: NavItem) => {
    const active = isActive(item);
    const cls = `relative text-sm font-medium transition-colors duration-150 ${
      active ? "text-[#D4A017]" : "text-[#1E3A8A] hover:text-[#D4A017]"
    } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:bg-[#D4A017] after:transition-all after:duration-200 ${
      active ? "after:w-full" : "after:w-0 hover:after:w-full"
    }`;

    if (item.type === "route") {
      return (
        <Link key={item.label} to={item.to} className={cls}>
          {item.label}
        </Link>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        onClick={() => handleScroll(item.targetId, item.path)}
        className={cls}
      >
        {item.label}
      </button>
    );
  };

  // ===== MOBILE MENU ROW =====
  const renderMobileLink = (item: NavItem, index: number) => {
    const active = isActive(item);
    const Icon = item.icon;
    const num = String(index + 1).padStart(2, "0");

    const inner = (
      <>
        {/* Index number */}
        <span
          className={`font-mono text-[11px] tracking-widest pt-1 transition-colors ${
            active ? "text-[#D4A017]" : "text-white/30 group-hover:text-[#D4A017]/70"
          }`}
        >
          {num}
        </span>

        {/* Label */}
        <span className="flex-1 flex items-center gap-3">
          <span
            className={`font-heading text-[1.75rem] leading-none font-bold tracking-tight transition-colors ${
              active ? "text-[#D4A017]" : "text-white group-hover:text-[#D4A017]"
            }`}
          >
            {item.label}
          </span>
        </span>

        {/* Icon */}
        <span
          className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all ${
            active
              ? "border-[#D4A017]/50 bg-[#D4A017]/10 text-[#D4A017]"
              : "border-white/10 bg-white/[0.03] text-white/60 group-hover:border-[#D4A017]/40 group-hover:text-[#D4A017]"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </>
    );

    const rowCls =
      "group relative w-full flex items-start gap-4 px-5 py-4 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.03] active:scale-[0.99] transition-all duration-200";

    const style: React.CSSProperties = {
      opacity: open ? 1 : 0,
      transform: open ? "translateY(0)" : "translateY(14px)",
      transition: `opacity 0.4s ease ${120 + index * 55}ms, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${120 + index * 55}ms`,
    };

    if (item.type === "route") {
      return (
        <Link
          key={item.label}
          to={item.to}
          className={rowCls}
          style={style}
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            navigate(item.to);
          }}
        >
          {inner}
        </Link>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        onClick={() => {
          setOpen(false);
          handleScroll(item.targetId, item.path);
        }}
        className={`${rowCls} text-left`}
        style={style}
      >
        {inner}
      </button>
    );
  };

  return (
    <>
      {/* ===== DESKTOP PILL ===== */}
      <div
        ref={containerRef}
        className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-50"
        style={{ width: "max-content", maxWidth: "calc(100vw - 32px)" }}
      >
        <div
          className="bg-white border border-[#e2e8f0] rounded-full shadow-md flex items-center"
          style={{ height: 56 }}
        >
          <Link to="/" className="flex items-center gap-2 pl-4 pr-2 shrink-0">
            <img
              src={mesaLogo}
              alt="MESA KU - Mechanical Engineering Students Association Kenyatta University logo"
              className="h-9 w-auto"
            />
            <span className="hidden sm:inline text-sm font-semibold text-[#1E3A8A] font-heading">
              MESA KU
            </span>
          </Link>
          <nav className="flex items-center gap-6 px-4 pr-6">
            {navItems.map((item) => renderDesktopLink(item))}
          </nav>
        </div>
      </div>

      {/* ===== MOBILE FLOATING TOP BAR ===== */}
      <div className="md:hidden fixed top-3 left-3 right-3 z-[60]">
        <div
          className={`flex items-center justify-between h-14 pl-3 pr-2 rounded-2xl border transition-all duration-300 ${
            open
              ? "bg-[#0f1d33]/90 border-white/10 backdrop-blur-xl"
              : scrolled
              ? "bg-white/85 border-[#1E3A8A]/10 backdrop-blur-xl shadow-[0_8px_30px_-10px_rgba(15,29,51,0.25)]"
              : "bg-white/95 border-[#1E3A8A]/10 shadow-[0_4px_20px_-8px_rgba(15,29,51,0.18)]"
          }`}
        >
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0"
            onClick={() => setOpen(false)}
          >
            <img
              src={mesaLogo}
              alt="MESA KU - Mechanical Engineering Students Association Kenyatta University logo"
              className="h-8 w-auto shrink-0"
            />
            <span
              className={`text-[15px] font-bold font-heading tracking-tight truncate transition-colors ${
                open ? "text-white" : "text-[#1E3A8A]"
              }`}
            >
              MESA <span className="text-[#D4A017]">KU</span>
            </span>
          </Link>

          {/* Pill toggle button */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`relative h-10 px-3.5 inline-flex items-center gap-2 rounded-xl transition-all duration-300 ${
              open
                ? "bg-[#D4A017] text-[#0f1d33]"
                : "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90"
            }`}
          >
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase">
              {open ? "Close" : "Menu"}
            </span>
            <div className="relative w-4 h-3">
              <span
                className="absolute left-0 top-0 block h-[2px] w-4 rounded transition-all duration-300 origin-center bg-current"
                style={{
                  transform: open ? "translateY(5px) rotate(45deg)" : "translateY(0)",
                }}
              />
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 block h-[2px] w-4 rounded transition-all duration-300 bg-current"
                style={{ opacity: open ? 0 : 1, transform: open ? "scaleX(0)" : "scaleX(1)" }}
              />
              <span
                className="absolute left-0 bottom-0 block h-[2px] w-4 rounded transition-all duration-300 origin-center bg-current"
                style={{
                  transform: open ? "translateY(-5px) rotate(-45deg)" : "translateY(0)",
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ===== MOBILE FULL-SCREEN MENU ===== */}
      <div
        className="md:hidden fixed inset-0 z-50 overflow-hidden"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        aria-hidden={!open}
      >
        {/* Layered background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, #1E3A8A 0%, #0f1d33 45%, #08111f 100%)",
            transform: open ? "scale(1)" : "scale(1.05)",
            transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />

        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow accent */}
        <div
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(212,160,23,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <img src={mesaLogo} alt="" className="w-[75%] max-w-md" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col pt-20 pb-6 px-4">
          {/* Eyebrow */}
          <div
            className="px-5 mb-4 flex items-center gap-3"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease 80ms, transform 0.4s ease 80ms",
            }}
          >
            <span className="h-px flex-1 bg-gradient-to-r from-[#D4A017]/60 to-transparent" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#D4A017]/80">
              Navigate
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-[#D4A017]/60 to-transparent" />
          </div>

          {/* Nav items */}
          <nav className="flex-1 flex flex-col justify-center gap-0.5 overflow-y-auto">
            {navItems.map((item, i) => renderMobileLink(item, i))}
          </nav>

          {/* Footer / secondary actions */}
          <div
            className="mt-6 pt-5 border-t border-white/10"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.4s ease ${120 + navItems.length * 55 + 80}ms, transform 0.4s ease ${120 + navItems.length * 55 + 80}ms`,
            }}
          >
            <a
              href="mailto:mesa@ku.ac.ke"
              className="group flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#D4A017] text-[#0f1d33] font-bold text-sm tracking-wide active:scale-[0.98] transition-transform"
              onClick={() => setOpen(false)}
            >
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Get in touch
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="mt-4 flex items-center justify-between px-2">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                MESA · KU · 2026
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/70 hover:text-[#D4A017] hover:border-[#D4A017]/40 transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/70 hover:text-[#D4A017] hover:border-[#D4A017]/40 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer so mobile content isn't hidden under fixed top bar */}
      <div className="md:hidden h-20" aria-hidden />
    </>
  );
};

export default Navbar;
