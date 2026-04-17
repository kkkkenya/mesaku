import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import mesaLogo from "@/assets/mesa-logo.png";

const CLUB_EMAIL = "mechstudentsassociation.ku@gmail.com";

type NavItem =
  | { label: string; type: "scroll"; targetId: string }
  | { label: string; type: "route"; to: string }
  | { label: string; type: "mailto"; email: string };

const navItems: NavItem[] = [
  { label: "Home", type: "scroll", targetId: "hero" },
  { label: "About", type: "scroll", targetId: "about" },
  { label: "Events", type: "route", to: "/events" },
  { label: "Gallery", type: "route", to: "/gallery" },
  { label: "Announcements", type: "route", to: "/announcements" },
  { label: "Merch", type: "scroll", targetId: "merchandise" },
  { label: "Contact", type: "mailto", email: CLUB_EMAIL },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  const handleMailto = (email: string) => {
    window.location.href = `mailto:${email}`;
    setOpen(false);
  };

  const renderLink = (item: NavItem, mobile: boolean) => {
    const baseDesktop =
      "text-sm font-medium text-[#1E3A8A] hover:text-[#D4A017] transition-colors duration-150";
    const baseMobile =
      "h-12 flex items-center px-5 text-base font-medium text-[#1E3A8A] border-b border-gray-100";
    const cls = mobile ? baseMobile : baseDesktop;

    if (item.type === "route") {
      return (
        <Link key={item.label} to={item.to} className={cls} onClick={() => setOpen(false)}>
          {item.label}
        </Link>
      );
    }
    if (item.type === "scroll") {
      return (
        <button
          key={item.label}
          type="button"
          onClick={() => handleScroll(item.targetId)}
          className={`${cls} ${mobile ? "w-full text-left" : ""}`}
        >
          {item.label}
        </button>
      );
    }
    return (
      <button
        key={item.label}
        type="button"
        onClick={() => handleMailto(item.email)}
        className={`${cls} ${mobile ? "w-full text-left" : ""}`}
      >
        {item.label}
      </button>
    );
  };

  const joinBtnDesktop =
    "h-9 px-5 rounded-full bg-[#1E3A8A] text-white text-sm font-semibold hover:bg-[#D4A017] transition-colors duration-200";
  const joinBtnMobile =
    "w-full h-12 rounded-xl bg-[#1E3A8A] text-white text-base font-semibold hover:bg-[#D4A017] transition-colors duration-200";

  return (
    <div
      ref={containerRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      style={{ width: "max-content", maxWidth: "calc(100vw - 32px)" }}
    >
      {/* Pill */}
      <div
        className="bg-white border border-[#e2e8f0] rounded-full shadow-md flex items-center"
        style={{ height: 56 }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 pl-4 pr-2 shrink-0">
          <img src={mesaLogo} alt="MESA KU Logo" className="h-9 w-auto" />
          <span className="hidden sm:inline text-sm font-semibold text-[#1E3A8A] font-heading">
            MESA KU
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 px-4">
          {navItems.map((item) => renderLink(item, false))}
        </nav>

        {/* Desktop Join Us */}
        <div className="hidden md:flex items-center pr-2">
          <button
            type="button"
            onClick={() => handleScroll("hero")}
            className={joinBtnDesktop}
          >
            Join Us
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden ml-auto mr-3 inline-flex h-11 w-11 items-center justify-center text-[#1E3A8A]"
        >
          {open ? <X size={22} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden mt-2 bg-white rounded-2xl shadow-lg border border-[#e2e8f0] overflow-hidden transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col">
          {navItems.map((item) => renderLink(item, true))}
        </nav>
        <div className="p-4">
          <button
            type="button"
            onClick={() => handleScroll("hero")}
            className={joinBtnMobile}
          >
            Join Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
