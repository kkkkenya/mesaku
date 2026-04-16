import { Menu, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import mesaLogo from "@/assets/mesa-logo.png";

const CLUB_EMAIL = "mechstudentsassociation.ku@gmail.com";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [mobileOpen]);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Gallery", href: "#gallery" },
    { label: "Merch", href: "#merchandise" },
    { label: "Contact", href: `mailto:${CLUB_EMAIL}` },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("mailto:")) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4">
      <header
        className={[
          "mx-auto flex max-w-6xl items-center justify-between rounded-full border",
          "backdrop-blur-xl transition-all duration-200 ease-out",
          scrolled
            ? "bg-[#F6EFE6]/95 shadow-[0_14px_36px_rgba(13,11,8,0.14)] px-5 py-3 border-[#0D0B08]/10"
            : "bg-[#F6EFE6]/85 shadow-[0_10px_30px_rgba(13,11,8,0.10)] px-6 py-4 border-[#0D0B08]/[0.08]",
        ].join(" ")}
      >
        {/* Logo */}
        <a href="#hero" onClick={(e) => handleClick(e, "#hero")} className="flex items-center gap-3 shrink-0">
          <img
            src={mesaLogo}
            alt="MESA KU Logo"
            className="h-8 md:h-10 w-auto"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none text-[#0D0B08] font-heading">
              MESA
            </p>
            <p className="text-xs text-[#5A4D42]">
              Mechanical Engineering
            </p>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#5A4D42]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="transition-colors duration-200 hover:text-[#0D0B08]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="#hero"
            onClick={(e) => handleClick(e, "#hero")}
            className="hidden sm:inline-flex items-center rounded-full bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#15498f]"
          >
            Join Us
          </a>
          <button
            ref={buttonRef}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#0D0B08]/10 text-[#0D0B08] md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`md:hidden mx-auto max-w-6xl mt-2 rounded-2xl border border-[#0D0B08]/10 bg-white backdrop-blur-xl shadow-[0_14px_36px_rgba(13,11,8,0.14)] overflow-hidden transition-all duration-200 ease-out ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 border-0 mt-0"
        }`}
      >
        <nav className="flex flex-col">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="text-base font-medium text-[#5A4D42] transition-colors hover:text-[#0D0B08] h-12 flex items-center px-6 border-b border-[#E5E7EB]"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#hero"
            onClick={(e) => handleClick(e, "#hero")}
            className="inline-flex items-center justify-center m-4 rounded-full bg-[#1E3A8A] px-5 h-12 text-base font-semibold text-white"
          >
            Join Us
          </a>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
