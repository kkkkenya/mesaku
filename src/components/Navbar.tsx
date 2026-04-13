import { Wrench, Search, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2">
          <Wrench className="w-8 h-8 text-primary" />
          <span className="font-heading text-xl font-bold text-navy">MESA</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {["HOME", "EVENTS", "GALLERY", "PROJECTS"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium tracking-wide text-navy hover:text-primary transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-navy hover:text-primary transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-1 text-sm font-medium text-navy hover:text-primary transition-colors">
            EN <ChevronDown className="w-3 h-3" />
          </button>
          <a
            href="#apply"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            JOIN NOW
          </a>
        </div>

        <button className="md:hidden text-navy" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="px-6 py-4 flex flex-col gap-4">
            {["HOME", "EVENTS", "GALLERY", "PROJECTS"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-navy">
                {item}
              </a>
            ))}
            <a href="#apply" className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold text-center">
              JOIN NOW
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
