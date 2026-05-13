import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Info,
  CalendarDays,
  Image as ImageIcon,
  Megaphone,
  ShoppingBag,
  Mail,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import mesaLogo from "@/assets/mesa-logo.png";

type NavItem =
  | { label: string; type: "scroll"; targetId: string; path: string; icon: React.ComponentType<{ className?: string }> }
  | { label: string; type: "route"; to: string; icon: React.ComponentType<{ className?: string }> }
  | { label: string; type: "external"; href: string; icon: React.ComponentType<{ className?: string }> };

// Desktop keeps Announcements; Mobile uses a tighter primary list.
const desktopNavItems: NavItem[] = [
  { label: "Home", type: "route", to: "/", icon: Home },
  { label: "About", type: "scroll", targetId: "about", path: "/", icon: Info },
  { label: "Events", type: "route", to: "/events", icon: CalendarDays },
  { label: "Gallery", type: "route", to: "/gallery", icon: ImageIcon },
  { label: "Announcements", type: "route", to: "/announcements", icon: Megaphone },
  { label: "Merch", type: "scroll", targetId: "merchandise", path: "/", icon: ShoppingBag },
];

const mobileNavItems: NavItem[] = [
  { label: "Home", type: "route", to: "/", icon: Home },
  { label: "About", type: "scroll", targetId: "about", path: "/", icon: Info },
  { label: "Events", type: "route", to: "/events", icon: CalendarDays },
  { label: "Gallery", type: "route", to: "/gallery", icon: ImageIcon },
  { label: "Merch", type: "scroll", targetId: "merchandise", path: "/", icon: ShoppingBag },
  { label: "Contact", type: "external", href: "mailto:mechstudentsassociation.ku@gmail.com", icon: Mail },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
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

  // Mobile drawer: scroll lock, escape, focus trap, restore focus on close
  useEffect(() => {
    if (!open) return;
    if (window.innerWidth >= 768) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
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

    // Move focus to first interactive element in drawer
    const t = setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    }, 80);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      // Return focus to the trigger
      triggerRef.current?.focus();
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
    if (item.type === "external") {
      return (
        <a key={item.label} href={item.href} className={cls}>
          {item.label}
        </a>
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

  // ===== MOBILE LINK ROW (minimal) =====
  const renderMobileLink = (item: NavItem, index: number) => {
    const active = isActive(item);
    const Icon = item.icon;

    const inner = (
      <>
        <Icon
          className={`h-5 w-5 shrink-0 transition-colors ${
            active ? "text-[#D4A017]" : "text-[#1E3A8A]/70 group-hover:text-[#1E3A8A]"
          }`}
        />
        <span
          className={`flex-1 font-medium text-[17px] transition-colors ${
            active ? "text-[#D4A017]" : "text-[#0f1d33] group-hover:text-[#1E3A8A]"
          }`}
        >
          {item.label}
        </span>
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" aria-hidden />
        )}
      </>
    );

    const rowCls =
      "group flex items-center gap-4 w-full min-h-[52px] px-4 rounded-xl hover:bg-[#1E3A8A]/[0.04] active:bg-[#1E3A8A]/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40 transition-colors";

    const style: React.CSSProperties = {
      opacity: open ? 1 : 0,
      transform: open ? "translateX(0)" : "translateX(8px)",
      transition: `opacity 0.25s ease ${60 + index * 35}ms, transform 0.3s ease ${60 + index * 35}ms`,
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
    if (item.type === "external") {
      return (
        <a
          key={item.label}
          href={item.href}
          className={rowCls}
          style={style}
          onClick={() => setOpen(false)}
        >
          {inner}
        </a>
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
            {desktopNavItems.map((item) => renderDesktopLink(item))}
          </nav>
        </div>
      </div>

      {/* ===== MOBILE COMPACT TOP BAR ===== */}
      <div className="md:hidden fixed top-0 inset-x-0 z-[60]">
        <div
          className={`flex items-center justify-between h-14 px-4 transition-colors duration-200 ${
            scrolled || open
              ? "bg-white/95 backdrop-blur-md border-b border-gray-100"
              : "bg-white/80 backdrop-blur-sm"
          }`}
        >
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40 rounded-md"
            onClick={() => setOpen(false)}
            aria-label="MESA KU — Home"
          >
            <img src={mesaLogo} alt="" className="h-7 w-auto shrink-0" />
            <span className="text-[15px] font-bold font-heading tracking-tight text-[#1E3A8A]">
              MESA <span className="text-[#D4A017]">KU</span>
            </span>
          </Link>

          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="h-11 w-11 -mr-2 inline-flex items-center justify-center rounded-full text-[#1E3A8A] hover:bg-[#1E3A8A]/[0.06] active:bg-[#1E3A8A]/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40 transition-colors"
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ===== MOBILE BACKDROP ===== */}
      <div
        className="md:hidden fixed inset-0 z-[55] bg-black/30 backdrop-blur-[2px]"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* ===== MOBILE SLIDE-OVER DRAWER ===== */}
      <div
        id="mobile-menu"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className="md:hidden fixed top-0 right-0 bottom-0 z-[58] w-[86%] max-w-[340px] bg-white shadow-xl flex flex-col"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
          visibility: open ? "visible" : "hidden",
        }}
        aria-hidden={!open}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
          <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-gray-400">
            Menu
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="h-11 w-11 -mr-2 inline-flex items-center justify-center rounded-full text-[#1E3A8A] hover:bg-[#1E3A8A]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/40"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {mobileNavItems.map((item, i) => renderMobileLink(item, i))}
        </nav>

        {/* Footer / brand line */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 tracking-wide">
            MESA · Kenyatta University
          </p>
        </div>
      </div>

      {/* Spacer so mobile content isn't hidden under fixed top bar */}
      <div className="md:hidden h-14" aria-hidden />
    </>
  );
};

export default Navbar;
