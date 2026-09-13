import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  CalendarDays,
  ShoppingBag,
  LogOut,
  Home,
  Megaphone,
  Menu,
  X,
  Mail,
  Users,
  FolderOpen,
  BookOpen,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import AdminTour, { shouldShowTour, resetTour } from "@/components/admin/AdminTour";

const links = [
  { to: "/admin/events", label: "Events", icon: CalendarDays, tour: "nav-events" },
  { to: "/admin/merchandise", label: "Merchandise", icon: ShoppingBag, tour: "nav-merchandise" },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone, tour: "nav-announcements" },
  { to: "/admin/executives", label: "Executives", icon: Users, tour: "nav-executives" },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail, tour: "nav-newsletter" },
  { to: "/admin/assets", label: "Assets", icon: FolderOpen, tour: "nav-assets" },
  { to: "/admin/help", label: "Guide & FAQ", icon: BookOpen, tour: "nav-help" },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  // Auto-start tour on first visit
  useEffect(() => {
    if (shouldShowTour()) {
      const t = setTimeout(() => setTourOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  const currentLabel =
    links.find((l) => location.pathname.startsWith(l.to))?.label ?? "Admin";

  const restartTour = () => {
    resetTour();
    setDrawerOpen(false);
    setTourOpen(true);
  };

  const SidebarContent = (
    <>
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-teal flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-teal-foreground" />
          </div>
          <span className="font-heading font-bold text-white text-lg tracking-tight">
            MESA-KU
          </span>
        </div>
        <p className="text-sm font-semibold text-white truncate">
          {user?.email?.split("@")[0] ?? "Admin"}
        </p>
        <p className="text-xs text-admin-sidebar-muted truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            data-tour={l.tour}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal/15 text-white border-l-[3px] border-teal pl-[calc(0.75rem-3px)]"
                  : "text-white/75 hover:bg-admin-sidebar-hover hover:text-white border-l-[3px] border-transparent pl-[calc(0.75rem-3px)]"
              }`
            }
          >
            <l.icon className="h-4 w-4 shrink-0" />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-3 py-3 border-t border-white/10 space-y-1">
        <button
          onClick={restartTour}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-admin-sidebar-hover hover:text-white transition-colors"
        >
          <HelpCircle className="h-4 w-4" /> Restart Tour
        </button>
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-admin-sidebar-hover hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" /> View Site
        </a>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-admin-sidebar-hover hover:text-white transition-colors w-full"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen md:flex bg-admin-bg">
      {/* ===== Mobile top bar ===== */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
        <button
          type="button"
          aria-label="Open admin menu"
          onClick={() => setDrawerOpen(true)}
          className="h-10 w-10 inline-flex items-center justify-center -ml-2 rounded-md hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-base font-bold text-slate-900 truncate">
          {currentLabel}
        </h1>
        <div className="w-10" />
      </header>

      {/* ===== Desktop sidebar ===== */}
      <aside
        data-tour="sidebar"
        className="hidden md:flex w-64 bg-admin-sidebar flex-col shrink-0"
      >
        {SidebarContent}
      </aside>

      {/* ===== Mobile drawer + backdrop ===== */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85%] bg-admin-sidebar flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setDrawerOpen(false)}
          className="absolute top-3 right-3 h-9 w-9 inline-flex items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {SidebarContent}
      </aside>

      {/* ===== Main ===== */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* ===== Onboarding tour ===== */}
      <AdminTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
