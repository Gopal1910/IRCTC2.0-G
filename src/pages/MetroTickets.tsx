import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// --- Delhi Metro Stations (80+)
const delhiMetroStations = [
  "Rajiv Chowk", "Dwarka Sector 21", "Kashmere Gate", "HUDA City Centre", "Rithala",
  "Shaheed Sthal", "Inderlok", "Netaji Subhash Place", "Dwarka Mor", "MG Road",
  "Janakpuri West", "Sikanderpur", "Botanical Garden", "Noida City Centre",
  "Yamuna Bank", "Anand Vihar", "Preet Vihar", "Shiv Vihar", "Dwarka Sector 10",
  "Dwarka Sector 9", "Dwarka Sector 8", "Dwarka Sector 7", "Dwarka Sector 6", "Dwarka Sector 5",
  "Dwarka Sector 4", "Dwarka Sector 3", "Dwarka Sector 2", "Dwarka Sector 1", "R.K. Puram",
  "AIIMS", "INA", "Jor Bagh", "Rajendra Place", "Karol Bagh",
  "Rajouri Garden", "Tagore Garden", "Subhash Nagar", "Peera Garhi", "Punjabi Bagh",
  "Moti Nagar", "Kirti Nagar", "Shadipur", "Patel Nagar", "Rajendra Place",
  "Barakhamba Road", "Central Secretariat", "Chawri Bazar", "New Delhi", "Shahdara",
  "Seelampur", "Welcome", "Mundka", "Nangloi", "Rohini West",
  "Rohini East", "Pitampura", "Netaji Subhash Place", "Kohat Enclave", "Dwarka Sector 21",
  "Dwarka Sector 12", "Dwarka Sector 13", "Dwarka Sector 14", "Dwarka Sector 15", "Dwarka Sector 16",
  "Dwarka Sector 17", "Dwarka Sector 18", "Dwarka Sector 19", "Dwarka Sector 20", "Dwarka Sector 22",
  "Dwarka Sector 23", "Dwarka Sector 24", "Dwarka Sector 25", "Dwarka Sector 26", "Dwarka Sector 27",
  "Dwarka Sector 28", "Dwarka Sector 29", "Dwarka Sector 30", "Dwarka Sector 31", "Dwarka Sector 32",
  "Dwarka Sector 33", "Dwarka Sector 34", "Dwarka Sector 35", "Dwarka Sector 36"
];

// --- Sample Metro Routes
const metroRoutes = [
  { id: 1, line: "Blue Line", from: "Rajiv Chowk", to: "Dwarka Sector 21", departure: "09:15 AM", duration: "45 mins", fare: 40, interchanges: 0 },
  { id: 2, line: "Yellow Line", from: "Kashmere Gate", to: "HUDA City Centre", departure: "10:30 AM", duration: "52 mins", fare: 50, interchanges: 1 },
  { id: 3, line: "Red Line", from: "Rithala", to: "Shaheed Sthal", departure: "11:45 AM", duration: "68 mins", fare: 60, interchanges: 2 },
];

const MetroTickets = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const generateRandomFare = (base: number) => {
    const extra = Math.floor(Math.random() * Math.max(1, Math.floor(base * 0.6)));
    return base + extra;
  };

  const generateRandomQrSvgDataUrl = (size = 300, grid = 21) => {
    const total = grid * grid;
    const rnd = new Uint8Array(total);
    window.crypto.getRandomValues(rnd);

    const cell = Math.floor(size / grid);
    const viewBox = `0 0 ${grid * cell} ${grid * cell}`;
    let rects = "";
    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        const idx = y * grid + x;
        const isBlack = rnd[idx] % 2 === 0;
        if (isBlack) {
          const rx = x * cell;
          const ry = y * cell;
          rects += `<rect x="${rx}" y="${ry}" width="${cell}" height="${cell}" />`;
        }
      }
    }

    const payload = `METRO|${Date.now().toString(36)}|${Math.random().toString(36).slice(2, 10)}`;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <g fill="#000000">${rects}</g>
        <text x="4" y="${grid * cell - 6}" font-size="8" fill="#666">${payload}</text>
      </svg>
    `.trim();

    const base64 = typeof window === "undefined" ? btoa(svg) : window.btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  };

  const handleBookingClick = (route: any) => {
    const randomFare = generateRandomFare(route.fare);
    setSelectedRoute(route);
    setPaymentAmount(randomFare);
    setIsPaid(false);
    setQrDataUrl(null);
    setIsPaymentOpen(true);
  };

  const handlePayNow = async () => {
    if (!selectedRoute || paymentAmount == null) return;
    setIsProcessingPayment(true);
    await new Promise((res) => setTimeout(res, 900));
    setIsPaid(true);
    const qr = generateRandomQrSvgDataUrl(360, 25);
    setQrDataUrl(qr);
    setIsProcessingPayment(false);
    toast.success("Payment successful! QR generated.");
  };

  const handleClosePayment = () => {
    setIsPaymentOpen(false);
    setSelectedRoute(null);
    setPaymentAmount(null);
    setIsPaid(false);
    setQrDataUrl(null);
    setIsProcessingPayment(false);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `metro-ticket-${selectedRoute?.line?.replace(/\s+/g, "-") || "ticket"}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // --- Filter routes based on selected stations
  const filteredRoutes = metroRoutes.filter(route => {
    return (!from || route.from === from) && (!to || route.to === to);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="ml-0 lg:ml-64 pt-24 px-4 sm:px-6 md:px-8 pb-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="pt-6 sm:pt-10">
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Metro Tickets</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Book metro tickets for seamless last-mile connectivity
            </p>
          </div>

          {/* Search Form */}
          <div className="glass-card p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>From Station</Label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-2 w-full border rounded p-2"
                >
                  <option value="">Select starting station</option>
                  {delhiMetroStations.map((station) => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>To Station</Label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-2 w-full border rounded p-2"
                >
                  <option value="">Select destination</option>
                  {delhiMetroStations.map((station) => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button className="w-full bg-gradient-to-r from-primary to-accent">
                  Search Metro Routes
                </Button>
              </div>
            </div>
          </div>

          {/* Metro Routes */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-6">Available Routes</h2>
            <div className="space-y-4">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="glass-card p-4 sm:p-6 md:p-6 transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                      <div>
                        <h3 className="font-display font-bold text-xl sm:text-2xl group-hover:text-accent transition-colors">
                          {route.line}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {route.interchanges} {route.interchanges === 1 ? "Interchange" : "Interchanges"}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-2xl sm:text-3xl font-display font-bold text-accent">
                          ₹{route.fare}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Per Person</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sm:text-base">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-semibold">{route.from}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Departure: {route.departure}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-center">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{route.duration}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Journey Time</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-end">
                        <MapPin className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-semibold">{route.to}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">Arrival</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleBookingClick(route)}
                      className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      Book Metro Ticket
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No routes found for selected stations.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Payment / QR Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={handleClosePayment}>
        <DialogContent className="w-full sm:w-11/12 md:w-2/3 lg:w-1/2 glass-card max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {isPaid ? "Your Ticket & QR" : `Pay for ${selectedRoute?.line ?? ""}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!isPaid ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-display font-bold text-lg">{selectedRoute?.from} → {selectedRoute?.to}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Amount to pay</p>
                  <p className="font-display font-bold text-3xl text-accent">₹{paymentAmount}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handlePayNow}
                    className="flex-1 bg-gradient-to-r from-primary to-accent"
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? "Processing..." : "Pay Now"}
                  </Button>
                  <Button variant="outline" onClick={handleClosePayment}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Paid for</p>
                  <p className="font-display font-bold text-lg">{selectedRoute?.from} → {selectedRoute?.to}</p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-display font-bold text-2xl text-accent">₹{paymentAmount}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Ticket ID</p>
                    <p className="font-mono text-xs text-muted-foreground break-all">
                      {`${selectedRoute?.id || "X"}-${Date.now().toString(36)}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {qrDataUrl ? (
                    <>
                      <img src={qrDataUrl} alt="Ticket QR" className="w-64 h-64 object-contain border rounded" />
                      <div className="flex gap-3">
                        <Button onClick={handleDownloadQr} className="bg-gradient-to-r from-primary to-accent">
                          Download QR
                        </Button>
                        <Button variant="outline" onClick={handleClosePayment}>
                          Close
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Generating QR...</p>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MetroTickets;
