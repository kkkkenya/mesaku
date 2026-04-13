import { Wrench, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Events", href: "#events" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ];

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
        <a href="#home" className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D0B08] text-[#F6EFE6]">
            <Wrench className="w-5 h-5" />
          </div>
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
              className="transition-colors duration-200 hover:text-[#0D0B08]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="#join"
            className="hidden sm:inline-flex items-center rounded-full bg-[#1958AD] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#15498f]"
          >
            Join Us
          </a>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#0D0B08]/10 text-[#0D0B08] md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden mx-auto max-w-6xl mt-2 rounded-2xl border border-[#0D0B08]/10 bg-[#F6EFE6]/95 backdrop-blur-xl shadow-[0_14px_36px_rgba(13,11,8,0.14)] px-6 py-4 animate-fade-in">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-[#5A4D42] transition-colors hover:text-[#0D0B08]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#join"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-[#1958AD] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Join Us
            </a>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;
