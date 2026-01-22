import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DashboardCards } from "@/components/DashboardCards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

interface IndexProps {
  onAuthOpen?: (type: "login" | "signup") => void;
}

const Index = ({ onAuthOpen }: IndexProps) => {
  const { currentUser, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="ml-0 lg:ml-64 pt-24 px-4 sm:px-6 md:px-8 pb-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Hero Section */}
          <div className="pt-6 sm:pt-10">
            <div
              className="relative bg-cover bg-center bg-no-repeat py-32 px-6 rounded-2xl overflow-hidden shadow-xl"
              style={{ backgroundImage: "url('/train.png')" }}
            >
              {/* Overlay gradients */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-gray-900/40 to-gray-900/50 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-600/15 to-orange-400/5 rounded-2xl"></div>

              {/* Content */}
              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex flex-col items-start justify-center space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                      Welcome to{" "}
                      <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                        SmartRail
                      </span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-200 font-light max-w-2xl leading-relaxed">
                      Revolutionizing railway travel with intelligent solutions and
                      seamless experiences
                    </p>
                  </div>

                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-3">
                    {["Real-time Tracking", "Smart Booking", "AI Assistance", "Secure Payments"].map(
                      (feature) => (
                        <span
                          key={feature}
                          className="px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full text-orange-100 text-sm font-medium"
                        >
                          {feature}
                        </span>
                      )
                    )}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 border-0"
                      onClick={() => setOpen(true)}
                    >
                      Explore Features
                    </Button>

                    {!currentUser && onAuthOpen && (
                      <>
                       
                      </>
                    )}

                    {currentUser && (
                      <>
                        <Button onClick={logout} size="lg" variant="outline">
                          Logout
                        </Button>
                        {/* Keep dashboard visible after login */}
                        <div className="pt-6">
                          <h3 className="text-xl sm:text-2xl font-display font-bold mb-4 text-foreground">
                            Quick Overview
                          </h3>
                          <DashboardCards />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute top-1/4 -right-4 w-48 h-48 bg-orange-500/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-1/4 -left-8 w-32 h-32 bg-orange-400/10 rounded-full blur-lg"></div>
            </div>
          </div>

          {/* Popular Routes */}
          <div className="pt-6">
            <h3 className="text-xl sm:text-2xl font-display font-bold mb-4 text-foreground">
              Popular Routes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Mumbai → Delhi", "Bangalore → Chennai", "Kolkata → Goa"].map((route) => (
                <div
                  key={route}
                  className="glass-card p-4 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <p className="font-display font-semibold group-hover:text-accent transition-colors">
                    {route}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Starting from ₹899</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learn More Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>SmartRail Details</DialogTitle>
              <DialogDescription>
                Here are some interesting train details powered by SmartRail:
              </DialogDescription>
            </DialogHeader>
            <ul className="mt-4 list-disc list-inside text-gray-700">
              <li>Real-time train tracking across India 🚆</li>
              <li>Automated ticket alerts and updates 🛎️</li>
              <li>Station information & amenities guide 🏟️</li>
              <li>Future-ready AI-based journey suggestions 🤖</li>
              <li>Seamless digital payment for tickets 💳</li>
            </ul>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Index;
