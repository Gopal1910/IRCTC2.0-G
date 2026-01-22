import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { SearchHero } from "@/components/SearchHero";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Users, QrCode, CreditCard, Wallet, Ticket, Download, Printer, Bell, Filter, X, Train, Navigation, Wifi } from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import { Passenger } from "@/firebase/bookings";
import { format } from "date-fns";

const trainResults = [
  {
    id: 1,
    name: "Rajdhani Express",
    number: "12301",
    from: "Mumbai",
    to: "Delhi",
    departure: "16:55",
    arrival: "08:35",
    duration: "15h 40m",
    durationMinutes: 940, // 15h 40m in minutes
    fare: 2850,
    availability: "Available - 42",
    class: "3A",
    comfort: 4, // 1-5 scale
  },
  {
    id: 2,
    name: "Shatabdi Express",
    number: "12002",
    from: "Mumbai",
    to: "Delhi",
    departure: "06:25",
    arrival: "14:30",
    duration: "8h 5m",
    durationMinutes: 485, // 8h 5m in minutes
    fare: 1890,
    availability: "Available - 18",
    class: "CC",
    comfort: 3,
  },
  {
    id: 3,
    name: "Duronto Express",
    number: "12263",
    from: "Mumbai",
    to: "Delhi",
    departure: "20:15",
    arrival: "10:05",
    duration: "13h 50m",
    durationMinutes: 830, // 13h 50m in minutes
    fare: 2450,
    availability: "RAC - 3",
    class: "2A",
    comfort: 4,
  },
  {
    id: 4,
    name: "Garib Rath",
    number: "12213",
    from: "Mumbai",
    to: "Delhi",
    departure: "22:30",
    arrival: "16:45",
    duration: "18h 15m",
    durationMinutes: 1095, // 18h 15m in minutes
    fare: 1200,
    availability: "Available - 25",
    class: "3A",
    comfort: 2,
  },
  {
    id: 5,
    name: "Tejas Express",
    number: "22119",
    from: "Mumbai",
    to: "Delhi",
    departure: "05:15",
    arrival: "11:30",
    duration: "6h 15m",
    durationMinutes: 375, // 6h 15m in minutes
    fare: 3200,
    availability: "Available - 12",
    class: "CC",
    comfort: 5,
  },
];

// Mock data for train tracking
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

// Enhanced IRCTC-style seat layout generator
const generateSeatLayout = (classType: string) => {
  if (classType === "CC") {
    return Array.from({ length: 60 }, (_, i) => {
      const row = Math.floor(i / 6) + 1;
      const seatInRow = (i % 6) + 1;
      return {
        id: i + 1,
        number: `${row}${String.fromCharCode(65 + seatInRow - 1)}`,
        status: Math.random() > 0.5 ? "available" : "reserved",
        category: Math.random() > 0.9 ? "ladies" : "general",
        berthType: "Seat",
        compartment: `C${row}`,
        position: 'main',
        row: row
      };
    });
  }

  let baysPerCoach = classType === "3A" ? 8 : 6;
  let seatsPerBay = classType === "3A" ? 6 : 4;

  return Array.from({ length: baysPerCoach * (seatsPerBay + 2) }, (_, i) => {
    const bay = Math.floor(i / (seatsPerBay + 2)) + 1;
    const positionInBay = i % (seatsPerBay + 2);

    let berthType = "";
    if (positionInBay < seatsPerBay) {
      if (classType === "3A") {
        berthType = positionInBay % 3 === 0 ? "Lower" : positionInBay % 3 === 1 ? "Middle" : "Upper";
      } else {
        berthType = positionInBay % 2 === 0 ? "Lower" : "Upper";
      }
    } else {
      berthType = positionInBay === seatsPerBay ? "Side Lower" : "Side Upper";
    }

    return {
      id: i + 1,
      number: i + 1,
      status: Math.random() > 0.5 ? "available" : "reserved",
      category: Math.random() > 0.9 ? "ladies" : Math.random() > 0.95 ? "senior" : "general",
      berthType,
      compartment: `B${bay}`,
      position: positionInBay < seatsPerBay ? 'main' : 'side',
      bay: bay
    };
  });
};

// Types for filter options
type SortOption = "default" | "cheapest" | "fastest" | "comfort";
type ClassPreference = "all" | "1A" | "2A" | "3A" | "CC";

const BookTickets = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { createBooking, notifications, markAsRead, markAllAsRead } = useBooking();

  const [selectedTrain, setSelectedTrain] = useState<typeof trainResults[0] | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [activeCompartment, setActiveCompartment] = useState("");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isTicketConfirmed, setIsTicketConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [passengerDetails, setPassengerDetails] = useState<Passenger[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [pnrNumber, setPnrNumber] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [journeyDate, setJourneyDate] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [classPreference, setClassPreference] = useState<ClassPreference>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Train tracker states
  const [trackedTrains, setTrackedTrains] = useState(mockTrains);
  const [selectedTrackedTrain, setSelectedTrackedTrain] = useState(null);
  const [showTrainTracker, setShowTrainTracker] = useState(false);

  const ticketRef = useRef<HTMLDivElement>(null);

  const seatLayout = useMemo(() => {
    return selectedTrain ? generateSeatLayout(selectedTrain.class) : [];
  }, [selectedTrain]);

  useEffect(() => {
    if (seatLayout.length > 0) {
      const firstCompartment = seatLayout[0].compartment;
      setActiveCompartment(firstCompartment);
    }
  }, [seatLayout]);

  useEffect(() => {
    if (location.state?.selectedTrain === 'Rajdhani Express') {
      const rajdhani = trainResults.find(train => train.name === 'Rajdhani Express');
      if (rajdhani) {
        setSelectedTrain(rajdhani);
        setSelectedSeats([]);
      }
    }

    // Set default journey date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setJourneyDate(tomorrow.toISOString().split('T')[0]);
  }, [location.state]);

  // Simulate real-time updates for train tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackedTrains(prevTrains =>
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

  // Filter and sort trains based on user preferences
  const filteredAndSortedTrains = useMemo(() => {
    let filtered = [...trainResults];

    // Filter by class preference
    if (classPreference !== "all") {
      filtered = filtered.filter(train => train.class === classPreference);
    }

    // Sort based on selected option
    switch (sortOption) {
      case "cheapest":
        return filtered.sort((a, b) => a.fare - b.fare);
      case "fastest":
        return filtered.sort((a, b) => a.durationMinutes - b.durationMinutes);
      case "comfort":
        return filtered.sort((a, b) => b.comfort - a.comfort);
      default:
        return filtered;
    }
  }, [sortOption, classPreference]);

  const compartmentsList = useMemo(() => {
    return Array.from(new Set(seatLayout.map((s) => s.compartment))).sort();
  }, [seatLayout]);

  const getSeatColor = (seat: any) => {
    if (selectedSeats.includes(seat.id))
      return "bg-accent text-white border-accent";
    if (seat.status === "reserved")
      return "bg-muted-foreground/20 cursor-not-allowed border-muted-foreground/20";
    if (seat.category === "ladies")
      return "bg-pink-500/20 border-pink-500 hover:bg-pink-500/30";
    if (seat.category === "senior")
      return "bg-blue-500/20 border-blue-500 hover:bg-blue-500/30";
    return "bg-primary/10 border-primary/30 hover:bg-primary/20";
  };

  const toggleSeat = (seatId: number) => {
    const seat = seatLayout.find((s) => s.id === seatId);
    if (!seat || seat.status === "reserved") return;

    const isSeniorCitizen = seat.category === "senior";
    const isLowerBerth =
      seat.berthType === "Lower" || seat.berthType === "Side Lower";

    if (isSeniorCitizen && !isLowerBerth) {
      alert(
        "As per policy, senior citizens are preferred to book lower or side lower berths."
      );
      return;
    }

    setSelectedSeats((prev) => {
      const newSeats = prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId];

      setPassengerDetails(newSeats.map((id) => {
        const existingDetail = passengerDetails.find((p: any) => p.id === id);
        const seatDetail = seatLayout.find((s) => s.id === id);
        return {
          id: id,
          name: existingDetail?.name || "",
          age: existingDetail?.age || "",
          gender: existingDetail?.gender || "Male",
          berthType: seatDetail?.berthType || "",
          compartment: seatDetail?.compartment || "",
          seatNumber: seatDetail?.number || "",
        };
      }));

      return newSeats;
    });
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const newDetails = [...passengerDetails];
    newDetails[index][field] = value;
    setPassengerDetails(newDetails);
  };

  const handleConfirmBooking = () => {
    if (!currentUser) {
      alert("Please login to book tickets");
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    if (!journeyDate) {
      alert("Please select a journey date");
      return;
    }
    setIsBookingDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedTrain || !currentUser || !journeyDate) return;

    try {
      // Create booking in Firebase
      const newBookingId = await createBooking({
        userId: currentUser.uid,
        trainId: selectedTrain.id,
        trainName: selectedTrain.name,
        trainNumber: selectedTrain.number,
        from: selectedTrain.from,
        to: selectedTrain.to,
        departure: selectedTrain.departure,
        arrival: selectedTrain.arrival,
        duration: selectedTrain.duration,
        class: selectedTrain.class,
        fare: selectedTrain.fare,
        passengers: passengerDetails,
        selectedSeats: selectedSeats,
        totalFare: selectedTrain.fare * selectedSeats.length,
        paymentMethod: paymentMethod,
        journeyDate: new Date(journeyDate)
      });

      setBookingId(newBookingId);
      setPnrNumber(newBookingId.substr(2)); // Use part of booking ID as PNR
      setIsBookingDialogOpen(false);
      setIsTicketConfirmed(true);

    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ticket-${pnrNumber}.pdf`);
  };

  const printTicket = async () => {
    if (!ticketRef.current) return;

    const canvas = await html2canvas(ticketRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Ticket</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const currentCompartmentSeats = seatLayout.filter(
    (s) => s.compartment === activeCompartment
  );

  const mainBerths = currentCompartmentSeats.filter(
    (s) => s.position === 'main'
  );
  const sideBerths = currentCompartmentSeats.filter(
    (s) => s.position === 'side'
  );

  // Train tracker functions
  const handleTrainSelect = (train) => {
    setSelectedTrackedTrain(train);
  };

  const handleCloseDetails = () => {
    setSelectedTrackedTrain(null);
  };

  const handleCloseMap = () => {
    setShowTrainTracker(false);
    setSelectedTrackedTrain(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      {/* Notifications Bell */}
      <div className="fixed top-24 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
        </Button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadNotifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            <div className="divide-y">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    onClick={() => notification.id && markAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <main className="ml-0 lg:ml-64 pt-20 px-4 sm:px-6 md:px-8 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="pt-6">
            <SearchHero />
          </div>

          {/* Train Tracker Button */}
          <div className="glass-card p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Need to Track Your Train?</h3>
            <Button
              onClick={() => setShowTrainTracker(true)}
              className="bg-gradient-to-r from-accent to-accent/80 hover:opacity-90"
              size="lg"
            >
              <Train className="h-5 w-5 mr-2" />
              Live Train Tracker
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Track trains in real-time with live location updates
            </p>
          </div>

          {/* Journey Date Selection */}

          {/* Advanced Filters */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-2xl font-display font-bold">
                Available Trains
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters & Sorting
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-card/50">
                {/* Sorting Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Sort By</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={sortOption === "default" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOption("default")}
                    >
                      Recommended
                    </Button>
                    <Button
                      variant={sortOption === "cheapest" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOption("cheapest")}
                    >
                      Cheapest
                    </Button>
                    <Button
                      variant={sortOption === "fastest" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOption("fastest")}
                    >
                      Fastest
                    </Button>
                    <Button
                      variant={sortOption === "comfort" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOption("comfort")}
                    >
                      Most Comfortable
                    </Button>
                  </div>
                </div>

                {/* Class Preference */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Class Preference</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={classPreference === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClassPreference("all")}
                    >
                      All Classes
                    </Button>
                    <Button
                      variant={classPreference === "1A" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClassPreference("1A")}
                    >
                      1st AC
                    </Button>
                    <Button
                      variant={classPreference === "2A" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClassPreference("2A")}
                    >
                      2nd AC
                    </Button>
                    <Button
                      variant={classPreference === "3A" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClassPreference("3A")}
                    >
                      3rd AC
                    </Button>
                    <Button
                      variant={classPreference === "CC" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setClassPreference("CC")}
                    >
                      Chair Car
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {(sortOption !== "default" || classPreference !== "all") && (
              <div className="flex flex-wrap gap-2 mt-4">
                {sortOption !== "default" && (
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {sortOption === "cheapest" && "💰 Cheapest"}
                    {sortOption === "fastest" && "⚡ Fastest"}
                    {sortOption === "comfort" && "😊 Most Comfortable"}
                    <button onClick={() => setSortOption("default")}>×</button>
                  </div>
                )}
                {classPreference !== "all" && (
                  <div className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {classPreference === "1A" && "1st AC"}
                    {classPreference === "2A" && "2nd AC"}
                    {classPreference === "3A" && "3rd AC"}
                    {classPreference === "CC" && "Chair Car"}
                    <button onClick={() => setClassPreference("all")}>×</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Train Results */}
          <div className="space-y-4">
            {filteredAndSortedTrains.map((train) => (
              <div
                key={train.id}
                className="glass-card p-6 hover:glow-accent transition-all cursor-pointer"
                onClick={() => {
                  setSelectedTrain(train);
                  setSelectedSeats([]);
                }}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                      <h3 className="font-display font-bold text-xl text-accent">
                        {train.name}
                      </h3>
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">
                        #{train.number}
                      </span>
                      <span className="bg-green-500/20 text-green-600 px-2 py-1 rounded text-sm">
                        {train.class}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{train.from} → {train.to}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{train.departure} - {train.arrival}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{train.availability}</span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Duration: {train.duration}</span>
                      <span>Comfort: {"★".repeat(train.comfort)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">
                      ₹{train.fare}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      per person
                    </p>
                    <Button className="mt-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      Select Seats
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Train Map Modal */}
      {showTrainTracker && (
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
                      {trackedTrains.map((train, index) => (
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
                      {trackedTrains.map(train => (
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
                              <span className={`text-xs px-2 py-1 rounded-full ${train.delay === "On Time" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
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
                  <div className="p-4 border rounded-lg">
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
                  </div>

                  <div className="p-4 border rounded-lg">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Train Details Modal */}
      {selectedTrackedTrain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-background">
              <h2 className="text-2xl font-display font-bold">{selectedTrackedTrain.name} Details</h2>
              <Button variant="ghost" size="icon" onClick={handleCloseDetails}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Train className="h-5 w-5 mr-2 text-accent" />
                    Train Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Train Number:</span>
                      <span className="font-medium">{selectedTrackedTrain.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route:</span>
                      <span className="font-medium text-right">{selectedTrackedTrain.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Speed:</span>
                      <span className="font-medium">{selectedTrackedTrain.speed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Station:</span>
                      <span className="font-medium">{selectedTrackedTrain.nextStation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${selectedTrackedTrain.delay === "On Time" ? "text-green-600" : "text-yellow-600"
                        }`}>
                        {selectedTrackedTrain.delay}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-accent" />
                    Passenger Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Occupancy:</span>
                      <span className="font-medium">{selectedTrackedTrain.passengers}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                      <div
                        className="bg-accent h-2.5 rounded-full"
                        style={{ width: selectedTrackedTrain.passengers }}
                      ></div>
                    </div>
                    <div className="pt-2">
                      <span className="text-muted-foreground">Amenities:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTrackedTrain.amenities.map(amenity => (
                          <span key={amenity} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg mb-6">
                <h3 className="font-bold mb-3 flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-accent" />
                  Live Location
                </h3>
                <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Train className="h-8 w-8 text-white" />
                    </div>
                    <p className="font-medium">Currently near {selectedTrackedTrain.nextStation}</p>
                    <p className="text-sm text-muted-foreground">Last updated: {selectedTrackedTrain.lastUpdated}</p>
                  </div>
                </div>
              </div>

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

      {/* Rest of the dialogs remain the same */}
      {/* Seat Selection Dialog */}
      <Dialog
        open={!!selectedTrain}
        onOpenChange={(open) => !open && setSelectedTrain(null)}
      >
        <DialogContent className="w-full sm:w-11/12 md:w-4/5 lg:max-w-6xl glass-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {selectedTrain?.name} - Seat Selection ({selectedTrain?.class})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Journey Date Display */}
            {journeyDate && (
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="font-semibold">Journey Date: {format(new Date(journeyDate), 'MMMM dd, yyyy')}</p>
              </div>
            )}

            {/* Compartment Tabs */}
            {selectedTrain?.class !== "CC" && (
              <div className="flex flex-wrap gap-2 justify-center">
                {compartmentsList.map((comp) => (
                  <Button
                    key={comp}
                    variant={activeCompartment === comp ? "default" : "outline"}
                    onClick={() => setActiveCompartment(comp)}
                    className={
                      activeCompartment === comp
                        ? "bg-accent/80 hover:bg-accent"
                        : "hover:bg-accent/10"
                    }
                  >
                    {comp}
                  </Button>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary/10 border border-primary/30 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pink-500/20 border border-pink-500 rounded"></div>
                <span>Ladies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500/20 border border-blue-500 rounded"></div>
                <span>Senior Citizens</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent text-white rounded"></div>
                <span>Selected</span>
              </div>
            </div>

            {/* IRCTC-style Seat Layout */}
            <div className="border rounded-lg p-4 bg-card/50">
              <h3 className="text-lg font-bold mb-4 text-center">
                {selectedTrain?.class === "CC" ? "Chair Car Layout" : `Compartment ${activeCompartment}`}
              </h3>

              {selectedTrain?.class === "CC" ? (
                <div className="space-y-2">
                  {Array.from({ length: 10 }, (_, rowIndex) => {
                    const rowSeats = seatLayout.filter(seat => seat.row === rowIndex + 1);
                    return (
                      <div key={rowIndex} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-semibold">Row {rowIndex + 1}</div>
                        <div className="flex gap-2 flex-1">
                          {rowSeats.map((seat) => (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeat(seat.id)}
                              disabled={seat.status === "reserved"}
                              className={`w-12 h-12 rounded border-2 transition-all text-sm font-semibold ${getSeatColor(seat)}`}
                            >
                              {seat.number}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-6">
                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-2">
                      {mainBerths.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat.id)}
                          disabled={seat.status === "reserved"}
                          className={`relative w-12 h-12 rounded border-2 transition-all text-sm font-semibold ${getSeatColor(seat)}`}
                        >
                          {seat.number}
                          <span className="absolute bottom-1 right-1 text-[10px] font-bold">
                            {seat.berthType.charAt(0)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-1 bg-border/50 rounded-full"></div>

                  <div className="w-20">
                    <div className="grid grid-cols-1 gap-2">
                      {sideBerths.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat.id)}
                          disabled={seat.status === "reserved"}
                          className={`relative w-12 h-12 rounded border-2 transition-all text-sm font-semibold ${getSeatColor(seat)}`}
                        >
                          {seat.number}
                          <span className="absolute bottom-1 right-1 text-[10px] font-bold">
                            {seat.berthType.includes('Lower') ? 'SL' : 'SU'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Berth Type Legend */}
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary/10 border border-primary/30 rounded"></div><span>L: Lower</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary/10 border border-primary/30 rounded"></div><span>M: Middle</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary/10 border border-primary/30 rounded"></div><span>U: Upper</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary/10 border border-primary/30 rounded"></div><span>SL: Side Lower</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary/10 border border-primary/30 rounded"></div><span>SU: Side Upper</span></div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 glass-card">
              <div>
                <p className="text-sm text-muted-foreground">Selected Seats</p>
                <p className="text-xl font-bold">
                  {selectedSeats.length}{" "}
                  {selectedSeats.length === 1 ? "Seat" : "Seats"}
                </p>
                {selectedSeats.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedSeats.map(id => {
                      const seat = seatLayout.find(s => s.id === id);
                      return `${seat?.compartment}-${seat?.number}`;
                    }).join(', ')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Fare</p>
                <p className="text-2xl font-bold text-accent">
                  ₹{selectedTrain ? selectedTrain.fare * selectedSeats.length : 0}
                </p>
              </div>
            </div>

            <Button
              disabled={selectedSeats.length === 0 || !journeyDate}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
              onClick={handleConfirmBooking}
            >
              Confirm Booking ({selectedSeats.length}{" "}
              {selectedSeats.length === 1 ? "Seat" : "Seats"})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Passenger Details & Payment Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="w-full sm:w-11/12 md:w-3/4 lg:max-w-3xl glass-card max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Passenger & Payment Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <h3 className="font-semibold text-xl">Passenger Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {passengerDetails.map((p, index) => (
                <div key={p.id} className="p-4 border rounded-lg bg-card/50">
                  <h4 className="font-bold mb-2">
                    Seat {p.compartment}-{p.seatNumber} ({p.berthType})
                  </h4>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor={`name-${index}`}>Full Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={p.name}
                        onChange={(e) => handlePassengerChange(index, "name", e.target.value)}
                        placeholder="Full Name as per ID"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`age-${index}`}>Age</Label>
                        <Input
                          id={`age-${index}`}
                          value={p.age}
                          onChange={(e) => handlePassengerChange(index, "age", e.target.value)}
                          type="number"
                          placeholder="Age"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`gender-${index}`}>Gender</Label>
                        <select
                          id={`gender-${index}`}
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-xl mt-6">Choose Payment Method</h3>
            <div className="flex flex-wrap gap-4">
              <Button
                variant={paymentMethod === 'upi' ? "default" : "outline"}
                className="flex-1 min-w-[150px] h-20"
                onClick={() => setPaymentMethod('upi')}
              >
                <QrCode className="mr-2 h-6 w-6" /> UPI / QR
              </Button>
              <Button
                variant={paymentMethod === 'card' ? "default" : "outline"}
                className="flex-1 min-w-[150px] h-20"
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="mr-2 h-6 w-6" /> Card
              </Button>
              <Button
                variant={paymentMethod === 'other' ? "default" : "outline"}
                className="flex-1 min-w-[150px] h-20"
                onClick={() => setPaymentMethod('other')}
              >
                <Wallet className="mr-2 h-6 w-6" /> Other
              </Button>
            </div>

            {paymentMethod === 'upi' && (
              <div className="p-4 border rounded-lg flex flex-col items-center justify-center space-y-4 text-center">
                <p className="text-lg font-semibold">Scan to Pay</p>
                <div className="p-4 bg-white rounded-md">
                  <QRCode
                    value={`upi://pay?pa=mockupi@bank&pn=RailConnect&am=${selectedTrain ? selectedTrain.fare * selectedSeats.length : 0}`}
                    size={200}
                  />
                </div>
                <Button onClick={handlePayment} className="mt-4">
                  Verify Payment
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground">Total Fare</p>
              <p className="font-display font-bold text-2xl text-accent">
                ₹{selectedTrain ? selectedTrain.fare * selectedSeats.length : 0}
              </p>
            </div>
            <Button
              onClick={handlePayment}
              disabled={!paymentMethod || passengerDetails.some(p => !p.name || !p.age)}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 mt-2"
            >
              Confirm Payment
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Confirmation Dialog */}
      <Dialog open={isTicketConfirmed} onOpenChange={setIsTicketConfirmed}>
        <DialogContent className="w-full sm:w-11/12 md:w-3/4 lg:max-w-4xl glass-card max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <Ticket className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <DialogTitle className="font-display text-3xl text-green-500">
              Booking Confirmed!
            </DialogTitle>
          </DialogHeader>

          {/* Printable Ticket */}
          <div ref={ticketRef} className="p-6 border-2 border-green-500 rounded-lg space-y-6 bg-white text-black">
            {/* Header */}
            <div className="text-center border-b-2 border-green-500 pb-4">
              <h1 className="text-3xl font-bold">INDIAN RAILWAYS</h1>
              <p className="text-lg">E-TICKET</p>
            </div>

            {/* Journey Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-xl text-accent mb-2">{selectedTrain?.name}</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Train No:</span> #{selectedTrain?.number}</p>
                  <p><span className="font-semibold">From:</span> {selectedTrain?.from}</p>
                  <p><span className="font-semibold">To:</span> {selectedTrain?.to}</p>
                  <p><span className="font-semibold">Departure:</span> {selectedTrain?.departure}</p>
                  <p><span className="font-semibold">Arrival:</span> {selectedTrain?.arrival}</p>
                  <p><span className="font-semibold">Class:</span> {selectedTrain?.class}</p>
                  <p><span className="font-semibold">Journey Date:</span> {journeyDate && format(new Date(journeyDate), 'MMMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Booking ID:</span> {bookingId}</p>
                  <p><span className="font-semibold">PNR Number:</span> {pnrNumber}</p>
                  <p><span className="font-semibold">Booking Date:</span> {format(new Date(), 'MMMM dd, yyyy')}</p>
                  <p><span className="font-semibold">Total Fare:</span> ₹{selectedTrain ? selectedTrain.fare * selectedSeats.length : 0}</p>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div>
              <h4 className="font-bold text-lg border-b mb-3">Passenger Details</h4>
              <div className="space-y-3">
                {passengerDetails.map((p, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-semibold">{p.name} ({p.gender}, {p.age} yrs)</p>
                      <p className="text-sm text-muted-foreground">
                        Seat: {p.compartment}-{p.seatNumber} | {p.berthType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{selectedTrain?.fare}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground border-t pt-4">
              <p>This is an electronically generated ticket. No signature required.</p>
              <p>Please carry original ID proof during journey.</p>
              <p className="font-bold mt-2">Thank you for choosing Indian Railways!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button onClick={downloadTicket} className="bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" /> Download Ticket
            </Button>
            <Button onClick={printTicket} variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Print Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookTickets;