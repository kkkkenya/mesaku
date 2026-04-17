import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, ShoppingBag, LogOut, Home, Megaphone } from "lucide-react";

const links = [
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/merchandise", label: "Merchandise", icon: ShoppingBag },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r bg-card flex flex-col shrink-0">
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
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
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
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted"
          >
            <Home className="h-4 w-4" /> View Site
          </a>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted w-full"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
