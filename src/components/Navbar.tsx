import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import mesaLogo from "@/assets/mesa-logo.png";

type NavItem =
  | { label: string; type: "scroll"; targetId: string; path: string }
  | { label: string; type: "route"; to: string };

const navItems: NavItem[] = [
  { label: "Home", type: "route", to: "/" },
  { label: "About", type: "scroll", targetId: "about", path: "/" },
  { label: "Events", type: "route", to: "/events" },
  { label: "Gallery", type: "route", to: "/gallery" },
  { label: "Announcements", type: "route", to: "/announcements" },
  { label: "Merch", type: "scroll", targetId: "merchandise", path: "/" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Click outside (desktop pill only — mobile drawer is full-screen)
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

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (open && window.innerWidth < 768) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const handleScroll = (id: string, path: string) => {
    if (location.pathname !== path) {
      // Navigate first, then scroll after route change
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

  // ===== MOBILE DRAWER LINK =====
  const renderMobileLink = (item: NavItem, index: number) => {
    const active = isActive(item);
    const baseCls = `group relative w-full text-left pl-6 pr-4 py-5 text-[1.4rem] font-bold transition-all duration-300 border-l-[3px] ${
      active
        ? "text-[#f5a623] border-[#f5a623]"
        : "text-white border-transparent hover:text-[#f5a623] hover:border-[#f5a623]"
    }`;
    const style: React.CSSProperties = {
      opacity: open ? 1 : 0,
      transform: open ? "translateX(0)" : "translateX(-20px)",
      transition: `opacity 0.3s ease ${100 + index * 50}ms, transform 0.3s ease ${100 + index * 50}ms, color 0.2s, border-color 0.2s`,
    };

    if (item.type === "route") {
      return (
        <Link
          key={item.label}
          to={item.to}
          className={baseCls}
          style={style}
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            navigate(item.to);
          }}
        >
          {item.label}
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
        className={baseCls}
        style={style}
      >
        {item.label}
      </button>
    );
  };

  return (
    <>
      {/* ===== DESKTOP PILL (unchanged) ===== */}
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
            <img src={mesaLogo} alt="MESA KU - Mechanical Engineering Students Association Kenyatta University logo" className="h-9 w-auto" />
            <span className="hidden sm:inline text-sm font-semibold text-[#1E3A8A] font-heading">
              MESA KU
            </span>
          </Link>
          <nav className="flex items-center gap-6 px-4 pr-6">
            {navItems.map((item) => renderDesktopLink(item))}
          </nav>
        </div>
      </div>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[#1a2e4a] shadow-md">
        <div className="h-16 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src={mesaLogo} alt="MESA KU - Mechanical Engineering Students Association Kenyatta University logo" className="h-9 w-auto" />
            <span className="text-base font-semibold text-white font-heading">MESA KU</span>
          </Link>

          {/* Animated hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative h-11 w-11 inline-flex items-center justify-center"
          >
            <span className="sr-only">Toggle menu</span>
            <div className="relative w-6 h-5">
              <span
                className="absolute left-0 top-0 block h-[2px] w-6 bg-white rounded transition-all duration-300 origin-center"
                style={{
                  transform: open ? "translateY(9px) rotate(45deg)" : "translateY(0) rotate(0)",
                }}
              />
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 block h-[2px] w-6 bg-white rounded transition-all duration-300"
                style={{ opacity: open ? 0 : 1 }}
              />
              <span
                className="absolute left-0 bottom-0 block h-[2px] w-6 bg-white rounded transition-all duration-300 origin-center"
                style={{
                  transform: open ? "translateY(-9px) rotate(-45deg)" : "translateY(0) rotate(0)",
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ===== MOBILE FULL-SCREEN DRAWER ===== */}
      <div
        className="md:hidden fixed inset-0 z-50"
        style={{
          transform: open ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          background:
            "linear-gradient(135deg, #1a2e4a 0%, #0f1d33 100%)",
          pointerEvents: open ? "auto" : "none",
        }}
        aria-hidden={!open}
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0.04 }}
        >
          <img src={mesaLogo} alt="" className="w-[80%] max-w-md" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col pt-20 pb-8 px-4">
          <nav className="flex-1 flex flex-col justify-center gap-1">
            {navItems.map((item, i) => renderMobileLink(item, i))}
          </nav>
        </div>
      </div>

      {/* Spacer so mobile content isn't hidden under fixed top bar */}
      <div className="md:hidden h-16" aria-hidden />
    </>
  );
};

export default Navbar;
