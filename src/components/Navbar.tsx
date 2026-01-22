import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { useBooking } from "@/contexts/BookingContext";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";

export const Navbar = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const { currentUser, logout } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { notifications, markAllAsRead } = useBooking();

  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleNotificationsOpen = (open: boolean) => {
    setNotifOpen(open);
    if (open && notifications.length > 0) {
      markAllAsRead();
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <>
      {/* ✅ Clean Navbar without shadow or black background */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50 shadow-none backdrop-filter-none !backdrop-blur-0 !bg-opacity-100">
        <div className="flex items-center justify-between px-6 py-3">
          {/* ✅ Logo + Hamburger */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-background/50">
                <img src="/logo.png" alt="SmartRail Logo" className="w-full h-full object-contain" />
              </div>

              <div>
                <h1 className="text-lg font-display font-bold text-foreground">SmartRail</h1>
                <p className="text-xs text-muted-foreground">IRCTC 2.0</p>
              </div>
            </Link>
          </div>

          {/* 🔍 Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trains, stations, bookings..."
                className="pl-10 bg-background/50"
              />
            </div>
          </div>

          {/* 🔔 Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Popover open={notifOpen} onOpenChange={handleNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-accent/10">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {unreadNotifications.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background border border-border/50 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-display font-bold">Notifications</h3>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-7"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border border-border/30 transition-colors ${!notification.isRead
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                            : "bg-background/50"
                          }`}
                      >
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      View all notifications
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* ☀️ Dark Mode Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* 👤 User Menu */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative hover:bg-accent/10">
                    <User className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline-block max-w-24 truncate">
                      {currentUser.displayName || currentUser.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border border-border/50 w-56">
                  <div className="px-2 py-1.5 border-b border-border/30 mb-1">
                    <p className="text-sm font-semibold truncate">
                      {currentUser.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=refunds" className="flex items-center cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Refund History
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=preferences" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLoginOpen(true)}
                  className="hidden sm:flex"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSignupOpen(true)}
                  className="hidden sm:flex"
                >
                  Sign Up
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLoginOpen(true)}
                  className="sm:hidden"
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🔐 Login & Signup Dialogs */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => {
          setSignupOpen(true);
          setLoginOpen(false);
        }}
      />
      <SignupDialog
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => {
          setLoginOpen(true);
          setSignupOpen(false);
        }}
      />
    </>
  );
};
