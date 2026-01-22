import { useState, useEffect } from "react";
import { TrendingUp, MapPin, Award, Clock, X, Train, Navigation, Users, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for trains
const mockTrains = [
  {
    id: "12345",
    name: "Rajdhani Express",
    number: "12951",
    route: "Mumbai Central - New Delhi",
    currentLocation: { lat: 19.0760, lng: 72.8777 }, // Mumbai
    nextStation: "Borivali",
    speed: "85 km/h",
    delay: "On Time",
    passengers: "85%",
    amenities: ["WiFi", "AC", "Food"],
    lastUpdated: "2 mins ago"
  },
  {
    id: "12346",
    name: "Shatabdi Express",
    number: "12009",
    route: "Chennai - Bangalore",
    currentLocation: { lat: 13.0827, lng: 80.2707 }, // Chennai
    nextStation: "Katpadi",
    speed: "92 km/h",
    delay: "5 mins late",
    passengers: "72%",
    amenities: ["WiFi", "Food"],
    lastUpdated: "5 mins ago"
  },
  {
    id: "12347",
    name: "Duronto Express",
    number: "12261",
    route: "Howrah - Delhi",
    currentLocation: { lat: 22.5726, lng: 88.3639 }, // Kolkata
    nextStation: "Dhanbad",
    speed: "78 km/h",
    delay: "On Time",
    passengers: "91%",
    amenities: ["AC", "Food"],
    lastUpdated: "1 min ago"
  },
  {
    id: "12348",
    name: "Garib Rath",
    number: "12201",
    route: "Delhi - Jammu",
    currentLocation: { lat: 28.7041, lng: 77.1025 }, // Delhi
    nextStation: "Sonipat",
    speed: "65 km/h",
    delay: "10 mins late",
    passengers: "68%",
    amenities: ["AC"],
    lastUpdated: "3 mins ago"
  },
  {
    id: "12349",
    name: "Tejas Express",
    number: "22119",
    route: "Mumbai - Goa",
    currentLocation: { lat: 18.5204, lng: 73.8567 }, // Pune
    nextStation: "Satara",
    speed: "88 km/h",
    delay: "On Time",
    passengers: "79%",
    amenities: ["WiFi", "AC", "Food", "Entertainment"],
    lastUpdated: "4 mins ago"
  }
];

const cards = [
  {
    icon: TrendingUp,
    title: "Recommended Journeys",
    description: "Based on your travel history",
    value: "3 Popular Routes",
    color: "from-primary to-primary/50",
  },
  {
    icon: MapPin,
    title: "Live Train Status",
    description: "Track trains in real-time",
    value: `${mockTrains.length} Trains Nearby`,
    color: "from-accent to-accent/50",
  },
  {
    icon: Award,
    title: "Your Rewards",
    description: "Loyalty points earned",
    value: "2,450 Points",
    color: "from-secondary to-secondary/50",
  },
  {
    icon: Clock,
    title: "Upcoming Bookings",
    description: "Your scheduled journeys",
    value: "2 Active",
    color: "from-primary/70 to-accent/70",
  },
];

export const DashboardCards = ({ isLoggedIn = true }) => {
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [trains, setTrains] = useState(mockTrains);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrains(prevTrains => 
        prevTrains.map(train => ({
          ...train,
          lastUpdated: "Just now",
          // Simulate small location changes
          currentLocation: {
            lat: train.currentLocation.lat + (Math.random() - 0.5) * 0.01,
            lng: train.currentLocation.lng + (Math.random() - 0.5) * 0.01
          }
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = () => {
    // When Live Train Status card is clicked, show the train map
    setSelectedTrain("map");
  };

  const handleTrainSelect = (train) => {
    setSelectedTrain(train);
  };

  const handleCloseDetails = () => {
    setSelectedTrain("map");
  };

  const handleCloseMap = () => {
    setSelectedTrain(null);
  };

  // If user is not logged in, don't show dashboard
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {cards.map((card, index) => (
          <Card
            key={card.title}
            className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={card.title === "Live Train Status" ? handleCardClick : undefined}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:glow-accent transition-all`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-display font-bold text-lg mb-1">{card.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
            <p className="text-2xl font-display font-bold text-accent">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* Train Map Modal */}
      {selectedTrain === "map" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-display font-bold">Live Train Tracking</h2>
              <Button variant="ghost" size="icon" onClick={handleCloseMap}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-muted rounded-lg h-80 flex items-center justify-center relative">
                    {/* Simplified map representation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border">
                      {/* Map markers for trains */}
                      {trains.map((train, index) => (
                        <div 
                          key={train.id}
                          className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${20 + (index % 3) * 30}%`,
                            top: `${30 + Math.floor(index / 3) * 20}%`
                          }}
                          onClick={() => handleTrainSelect(train)}
                        >
                          <Train className="h-3 w-3 text-white" />
                        </div>
                      ))}
                      
                      {/* Map legend */}
                      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-sm">
                        <div className="flex items-center mb-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                          <span>Moving Trains</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                          <span>Stations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-bold text-lg mb-2">Nearby Trains</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {trains.map(train => (
                        <div 
                          key={train.id}
                          className="flex items-center p-3 border rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
                          onClick={() => handleTrainSelect(train)}
                        >
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <Train className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{train.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                train.delay === "On Time" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {train.delay}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{train.route}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-bold mb-3">Live Updates</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <p className="text-sm font-medium">Rajdhani Express is running on schedule</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <p className="text-sm font-medium">Signal issue resolved near Katpadi</p>
                          <p className="text-xs text-muted-foreground">15 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                        <div>
                          <p className="text-sm font-medium">Track maintenance completed on Central Line</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="font-bold mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline">
                        <Navigation className="h-4 w-4 mr-2" />
                        Set Route Alert
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Clock className="h-4 w-4 mr-2" />
                        Check PNR Status
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Train className="h-4 w-4 mr-2" />
                        Book Tickets
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Train Details Modal */}
      {selectedTrain && selectedTrain !== "map" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-background">
              <h2 className="text-2xl font-display font-bold">{selectedTrain.name} Details</h2>
              <Button variant="ghost" size="icon" onClick={handleCloseDetails}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="p-4">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Train className="h-5 w-5 mr-2 text-accent" />
                    Train Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Train Number:</span>
                      <span className="font-medium">{selectedTrain.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-medium text-right">{selectedTrain.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Speed:</span>
                      <span className="font-medium">{selectedTrain.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Station:</span>
                      <span className="font-medium">{selectedTrain.nextStation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        selectedTrain.delay === "On Time" ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {selectedTrain.delay}
                      </span>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-accent" />
                    Passenger Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Occupancy:</span>
                      <span className="font-medium">{selectedTrain.passengers}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-accent h-2.5 rounded-full" 
                        style={{ width: selectedTrain.passengers }}
                      ></div>
                    </div>
                    <div className="pt-2">
                      <span className="text-muted-foreground">Amenities:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTrain.amenities.map(amenity => (
                          <span key={amenity} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <Card className="p-4 mb-6">
                <h3 className="font-bold mb-3 flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-accent" />
                  Live Location
                </h3>
                <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Train className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-medium">Currently near {selectedTrain.nextStation}</p>
                    <p className="text-sm text-muted-foreground">Last updated: {selectedTrain.lastUpdated}</p>
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseDetails}>
                  Back to Map
                </Button>
                <Button>
                  <Wifi className="h-4 w-4 mr-2" />
                  Set Alert for This Train
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};