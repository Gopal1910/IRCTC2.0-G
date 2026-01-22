import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Index from "./pages/Index";
import BookTickets from "./pages/BookTickets";
import MetroTickets from "./pages/MetroTickets";
import Hotels from "./pages/Hotels";
import JourneyPlanner from "./pages/JourneyPlanner";
import Rewards from "./pages/Rewards";
import Support from "./pages/Support";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { LoginDialog } from "./components/LoginDialog";
import { SignupDialog } from "./components/SignupDialog";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/" replace />;
};

// Public Route Component
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return !currentUser ? <>{children}</> : <Navigate to="/book" replace />;
};

// App Routes Component
const AppRoutes = () => {
  const [authDialog, setAuthDialog] = useState<"login" | "signup" | null>(null);

  return (
    <>
      <Routes>
        {/* Public Route - Homepage */}
        <Route path="/" element={
          <PublicRoute>
            <Index onAuthOpen={(type) => setAuthDialog(type)} />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/book" element={
          <ProtectedRoute>
            <BookTickets />
          </ProtectedRoute>
        } />

        <Route path="/metro" element={
          <ProtectedRoute>
            <MetroTickets />
          </ProtectedRoute>
        } />

        <Route path="/hotels" element={
          <ProtectedRoute>
            <Hotels />
          </ProtectedRoute>
        } />

        <Route path="/planner" element={
          <ProtectedRoute>
            <JourneyPlanner />
          </ProtectedRoute>
        } />

        <Route path="/rewards" element={
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        } />

        <Route path="/support" element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Auth Dialogs */}
      <LoginDialog
        open={authDialog === "login"}
        onOpenChange={(open) => setAuthDialog(open ? "login" : null)}
        onSwitchToSignup={() => setAuthDialog("signup")}
      />

      <SignupDialog
        open={authDialog === "signup"}
        onOpenChange={(open) => setAuthDialog(open ? "signup" : null)}
        onSwitchToLogin={() => setAuthDialog("login")}
      />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        <BookingProvider>
          <SidebarProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </SidebarProvider>
        </BookingProvider>
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


