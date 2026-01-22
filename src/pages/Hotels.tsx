import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, UtensilsCrossed, Hotel as HotelIcon, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";

const stations = [
  "All Stations",
  "New Delhi",
  "Mumbai Central",
  "Chennai Central",
  "Howrah Junction",
  "Bangalore City",
  "Secunderabad",
  "Ahmedabad",
  "Lucknow Charbagh",
  "Bhopal Junction",
  "Jaipur Junction"
];

const hotels = [
  {
    id: 1,
    name: "Railway Retiring Rooms - New Delhi",
    location: "New Delhi Railway Station",
    station: "New Delhi",
    rating: 4.2,
    price: 1200,
    amenities: ["AC", "WiFi", "24/7 Service", "Attached Bathroom"],
    image: "hotel",
  },
  {
    id: 2,
    name: "Station View Hotel - Mumbai Central",
    location: "Mumbai Central Station",
    station: "Mumbai Central",
    rating: 4.5,
    price: 1800,
    amenities: ["AC", "Restaurant", "Parking", "Swimming Pool"],
    image: "hotel",
  },
  {
    id: 3,
    name: "Chennai Central Retiring Rooms",
    location: "Chennai Central Station",
    station: "Chennai Central",
    rating: 4.0,
    price: 1000,
    amenities: ["AC", "WiFi", "24/7 Service", "Laundry"],
    image: "hotel",
  },
  {
    id: 4,
    name: "Howrah Junction Guest Rooms",
    location: "Howrah Junction",
    station: "Howrah Junction",
    rating: 3.8,
    price: 800,
    amenities: ["Non-AC", "WiFi", "24/7 Service"],
    image: "hotel",
  },
  {
    id: 5,
    name: "Bangalore City Lodge",
    location: "Bangalore City Railway Station",
    station: "Bangalore City",
    rating: 4.3,
    price: 1500,
    amenities: ["AC", "WiFi", "Restaurant", "Parking"],
    image: "hotel",
  },
  {
    id: 6,
    name: "Secunderabad Rail Yatri Niwas",
    location: "Secunderabad Junction",
    station: "Secunderabad",
    rating: 4.1,
    price: 1100,
    amenities: ["AC", "WiFi", "24/7 Service", "Medical Help"],
    image: "hotel",
  },
];

const meals = [
  {
    id: 1,
    name: "Veg Thali",
    station: "New Delhi",
    price: 150,
    cuisine: "North Indian",
    delivery: "15 mins before arrival",
    type: "veg",
  },
  {
    id: 2,
    name: "Chicken Biryani",
    station: "Bhopal Junction",
    price: 200,
    cuisine: "Mughlai",
    delivery: "20 mins before arrival",
    type: "non-veg",
  },
  {
    id: 3,
    name: "South Indian Combo",
    station: "Chennai Central",
    price: 120,
    cuisine: "South Indian",
    delivery: "10 mins before arrival",
    type: "veg",
  },
  {
    id: 4,
    name: "Punjabi Thali",
    station: "New Delhi",
    price: 180,
    cuisine: "North Indian",
    delivery: "15 mins before arrival",
    type: "veg",
  },
  {
    id: 5,
    name: "Fish Curry Meal",
    station: "Howrah Junction",
    price: 220,
    cuisine: "Bengali",
    delivery: "25 mins before arrival",
    type: "non-veg",
  },
  {
    id: 6,
    name: "Hyderabadi Veg Meal",
    station: "Secunderabad",
    price: 130,
    cuisine: "South Indian",
    delivery: "12 mins before arrival",
    type: "veg",
  },
  {
    id: 7,
    name: "Gujarati Thali",
    station: "Ahmedabad",
    price: 140,
    cuisine: "Gujarati",
    delivery: "18 mins before arrival",
    type: "veg",
  },
  {
    id: 8,
    name: "Mutton Rogan Josh",
    station: "Lucknow Charbagh",
    price: 250,
    cuisine: "Awadhi",
    delivery: "22 mins before arrival",
    type: "non-veg",
  },
  {
    id: 9,
    name: "Jaipur Special Thali",
    station: "Jaipur Junction",
    price: 170,
    cuisine: "Rajasthani",
    delivery: "16 mins before arrival",
    type: "veg",
  },
];

const Hotels = () => {
  const [selectedStation, setSelectedStation] = useState("All Stations");
  const [searchQuery, setSearchQuery] = useState("");
  const [mealType, setMealType] = useState("all");

  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const matchesStation = selectedStation === "All Stations" || hotel.station === selectedStation;
      const matchesSearch = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStation && matchesSearch;
    });
  }, [selectedStation, searchQuery]);

  const filteredMeals = useMemo(() => {
    return meals.filter(meal => {
      const matchesStation = selectedStation === "All Stations" || meal.station === selectedStation;
      const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = mealType === "all" || meal.type === mealType;
      return matchesStation && matchesSearch && matchesType;
    });
  }, [selectedStation, searchQuery, mealType]);

  const handleHotelBook = (hotel: any) => {
    toast.success("Hotel booking initiated!", {
      description: `${hotel.name} - ₹${hotel.price}/night`,
    });
  };

  const handleMealOrder = (meal: any) => {
    toast.success("Meal pre-ordered successfully!", {
      description: `${meal.name} at ${meal.station} - ₹${meal.price}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />

      <main className="ml-0 lg:ml-64 pt-20 px-4 sm:px-6 md:px-8 pb-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="pt-6">
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
              Hotels & E-Catering
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Book railway retiring rooms and pre-order meals during your journey
            </p>
          </div>

          {/* Filters Section */}
          <div className="glass-card p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search hotels or meals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full lg:w-64">
                <label className="text-sm font-medium mb-2 block">Filter by Station</label>
                <Select value={selectedStation} onValueChange={setSelectedStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-48">
                <label className="text-sm font-medium mb-2 block">Meal Type</label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meals</SelectItem>
                    <SelectItem value="veg">Vegetarian</SelectItem>
                    <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Hotels Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
                <HotelIcon className="h-6 w-6 text-accent" />
                Railway Hotels & Retiring Rooms
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredHotels.length} {filteredHotels.length === 1 ? 'hotel' : 'hotels'} found
              </span>
            </div>

            {filteredHotels.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <HotelIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="glass-card p-6 hover:glow-accent transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                      <div>
                        <h3 className="font-display font-bold text-xl sm:text-2xl group-hover:text-accent transition-colors">
                          {hotel.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {hotel.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded self-start">
                        <Star className="h-4 w-4 text-accent fill-accent" />
                        <span className="font-semibold text-sm">{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-border/30 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Starting from</p>
                        <p className="text-2xl sm:text-3xl font-display font-bold text-accent">
                          ₹{hotel.price}
                        </p>
                        <p className="text-xs text-muted-foreground">per night</p>
                      </div>
                      <Button
                        onClick={() => handleHotelBook(hotel)}
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* E-Catering Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
                <UtensilsCrossed className="h-6 w-6 text-accent" />
                E-Catering - Pre-Order Meals
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredMeals.length} {filteredMeals.length === 1 ? 'meal' : 'meals'} found
              </span>
            </div>

            {filteredMeals.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No meals found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="glass-card p-6 hover:glow-accent transition-all group"
                  >
                    <div className="mb-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-display font-bold text-lg sm:text-xl group-hover:text-accent transition-colors">
                          {meal.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${meal.type === 'veg'
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-red-500/20 text-red-600'
                          }`}>
                          {meal.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{meal.cuisine}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm sm:text-base">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span>Delivery at {meal.station}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span>{meal.delivery}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-border/30 gap-4">
                      <p className="text-2xl sm:text-3xl font-display font-bold text-accent">₹{meal.price}</p>
                      <Button
                        onClick={() => handleMealOrder(meal)}
                        size="sm"
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        Pre-Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hotels;