import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Train, Car, Bus, MapPin, Clock, IndianRupee } from "lucide-react";

const journeyOptions = [
  {
    id: 1,
    type: "train",
    name: "Rajdhani Express",
    from: "Home (Uber)",
    to: "Destination (Metro)",
    segments: [
      { mode: "cab", name: "Uber to Station", duration: "20 mins", fare: 150 },
      { mode: "train", name: "Rajdhani Express", duration: "15h 40m", fare: 2850 },
      { mode: "metro", name: "Blue Line Metro", duration: "35 mins", fare: 40 },
    ],
    totalTime: "17h 35m",
    totalFare: 3040,
  },
  {
    id: 2,
    type: "train+bus",
    name: "Shatabdi Express + Local Bus",
    from: "Home (Auto)",
    to: "Destination (Bus)",
    segments: [
      { mode: "auto", name: "Auto to Station", duration: "15 mins", fare: 80 },
      { mode: "train", name: "Shatabdi Express", duration: "8h 5m", fare: 1890 },
      { mode: "bus", name: "Local Bus", duration: "45 mins", fare: 30 },
    ],
    totalTime: "9h 45m",
    totalFare: 2000,
  },
];

const JourneyPlanner = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "train":
        return <Train className="h-5 w-5" />;
      case "metro":
        return <Train className="h-5 w-5" />;
      case "cab":
      case "auto":
        return <Car className="h-5 w-5" />;
      case "bus":
        return <Bus className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="ml-16 lg:ml-64 pt-20 px-6 pb-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="pt-6">
            <h1 className="text-3xl font-display font-bold mb-2">Journey Planner</h1>
            <p className="text-muted-foreground">
              Plan your complete door-to-door journey with train, metro, cab & bus integration
            </p>
          </div>

          {/* Search Form */}
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>From (Your Location)</Label>
                <Input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Enter pickup location"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>To (Destination)</Label>
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter destination"
                  className="mt-2"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-gradient-to-r from-primary to-accent">
                  Plan Journey
                </Button>
              </div>
            </div>
          </div>

          {/* Journey Options */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-6">Recommended Routes</h2>
            <div className="space-y-6">
              {journeyOptions.map((journey) => (
                <div
                  key={journey.id}
                  className="glass-card p-6 hover:glow-accent transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display font-bold text-xl">{journey.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {journey.from} → {journey.to}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-accent">
                        ₹{journey.totalFare}
                      </p>
                      <p className="text-sm text-muted-foreground">{journey.totalTime}</p>
                    </div>
                  </div>

                  {/* Journey Segments */}
                  <div className="space-y-4">
                    {journey.segments.map((segment, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 text-accent">
                          {getModeIcon(segment.mode)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{segment.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {segment.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" />
                              {segment.fare}
                            </span>
                          </div>
                        </div>
                        {index < journey.segments.length - 1 && (
                          <div className="w-px h-8 bg-border ml-5"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-border/30">
                    <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      Book Complete Journey
                    </Button>
                    <Button variant="outline" className="hover:bg-accent/10">
                      Save Plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JourneyPlanner;
