import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, ShoppingBag, LogOut, Home, Megaphone, Menu, X, Mail } from "lucide-react";

const links = [
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/merchandise", label: "Merchandise", icon: ShoppingBag },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const SidebarContent = (
    <>
      <div className="p-4 border-b">
        <h2 className="font-heading text-lg font-bold">MESA Admin</h2>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-3 md:py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`
            }
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t space-y-1">
        <a
          href="/"
          className="flex items-center gap-2 px-3 py-3 md:py-2 rounded-md text-sm text-muted-foreground hover:bg-muted"
        >
          <Home className="h-4 w-4" /> View Site
        </a>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-3 md:py-2 rounded-md text-sm text-muted-foreground hover:bg-muted w-full"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen md:flex bg-background">
      {/* ===== Mobile top bar ===== */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-card border-b">
        <button
          type="button"
          aria-label="Open admin menu"
          onClick={() => setDrawerOpen(true)}
          className="h-10 w-10 inline-flex items-center justify-center -ml-2 rounded-md hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-base font-bold truncate">{currentLabel}</h1>
        <div className="w-10" />
      </header>

      {/* ===== Desktop sidebar ===== */}
      <aside className="hidden md:flex w-60 border-r bg-card flex-col shrink-0">
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
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85%] bg-card border-r flex flex-col transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setDrawerOpen(false)}
          className="absolute top-2 right-2 h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
        {SidebarContent}
      </aside>

      {/* ===== Main ===== */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
