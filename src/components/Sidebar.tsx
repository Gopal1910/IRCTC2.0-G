import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Train,
  Hotel,
  MapPin,
  Trophy,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Ticket, label: "Book Tickets", href: "/book" },
  { icon: Train, label: "Metro Tickets", href: "/metro" },
  { icon: Hotel, label: "Hotels & E-Catering", href: "/hotels" },
  { icon: MapPin, label: "Journey Planner", href: "/planner" },
  { icon: Trophy, label: "Rewards", href: "/rewards" },
  { icon: Headphones, label: "Support", href: "/support" },
];

export const Sidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    navigate(href);
    setIsCollapsed(true);
  };

  return (
    <>
      {/* ✅ Mobile Overlay */}
      <div
        onClick={() => setIsCollapsed(true)}
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 md:hidden",
          isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      />

      {/* ✅ Sidebar */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 glass-card border-r border-border/50 transition-all duration-300 ease-in-out",
          "w-64 md:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <nav className="p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md font-medium transition-all text-left",
                "hover:bg-accent/10 hover:text-accent"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 p-3 glass-card rounded-lg">
          <p className="text-xs text-muted-foreground">SmartRail v2.0</p>
          <p className="text-xs text-muted-foreground">Next-Gen Travel</p>
        </div>
      </aside>
    </>
  );
};