import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Clock, Plus, Trash2, ArrowUpDown, Home, Briefcase, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

const POPULAR_LOCATIONS = [
  { name: "Kotoka International Airport", address: "Airport, Accra", lat: 5.6052, lng: -0.1668 },
  { name: "Accra Mall", address: "Tetteh Quarshie, Accra", lat: 5.6228, lng: -0.1747 },
  { name: "University of Ghana", address: "Legon, Accra", lat: 5.6508, lng: -0.1870 },
  { name: "Kumasi Central Market", address: "Kumasi", lat: 6.6885, lng: -1.6244 },
  { name: "Osu Oxford Street", address: "Osu, Accra", lat: 5.5560, lng: -0.1789 },
  { name: "Makola Market", address: "Central Accra", lat: 5.5488, lng: -0.2079 },
  { name: "Tema Station", address: "Accra", lat: 5.5503, lng: -0.2015 },
  { name: "Circle Odorkor", address: "Accra", lat: 5.5689, lng: -0.2314 },
  { name: "East Legon", address: "Accra", lat: 5.6389, lng: -0.1678 },
  { name: "Spintex Road", address: "Accra", lat: 5.6147, lng: -0.1289 }
];

export default function DestinationSearch({ isOpen, onClose, onSelect }) {
  const [stops, setStops] = useState([]); // Array of { name, address, lat, lng }
  const [activeInputIndex, setActiveInputIndex] = useState(-1); // -1 for main destination, >= 0 for intermediate stops
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [destination, setDestination] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);

  // Load saved places from profile
  useEffect(() => {
    if (isOpen) {
      base44.auth.me().then(async (me) => {
        if (me) {
          try {
            const profiles = await base44.entities.RiderProfile.filter({ user_id: me.id });
            if (profiles.length > 0 && profiles[0].saved_locations) {
              setSavedPlaces(profiles[0].saved_locations);
            }
          } catch (err) {
            console.warn("Failed to load saved places");
          }
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("destinationSearchHistory");
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load search history");
      }
    }
  }, []);

  // Save to search history when a location is selected
  const saveToHistory = (location) => {
    const newEntry = {
      name: location.name,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      timestamp: Date.now()
    };
    setSearchHistory(prev => {
      const filtered = prev.filter(l => l.name !== location.name);
      const updated = [newEntry, ...filtered].slice(0, 10);
      localStorage.setItem("destinationSearchHistory", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (isOpen && query.length > 2) {
      setLoading(true);
      const timer = setTimeout(async () => {
        try {
          const res = await base44.functions.invoke("placesAutocomplete", { query });
          setSuggestions(res.data.predictions || []);
        } catch (err) {
          console.error("Places API error:", err);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query, isOpen]);

  const handleSelectLocation = (location) => {
    saveToHistory(location);
    
    // IF we have no stops added: instantly confirm and close the modal! (No "Done" button needed)
    if (stops.length === 0) {
      onSelect({
        ...location,
        stops: []
      });
      onClose();
      return;
    }

    // Otherwise, handle multi-stop inputs
    if (activeInputIndex === -1) {
      setDestination(location);
    } else {
      const newStops = [...stops];
      newStops[activeInputIndex] = location;
      setStops(newStops);
    }
    setQuery("");
  };

  const handleSelectPlace = async (placeId) => {
    try {
      const res = await base44.functions.invoke("placeDetails", { placeId });
      const data = res.data.result;
      if (data && data.geometry) {
        const location = {
          name: data.name || data.formatted_address,
          address: data.formatted_address,
          lat: data.geometry.location.lat,
          lng: data.geometry.location.lng
        };
        handleSelectLocation(location);
      }
    } catch (err) {
      console.error("Place details error:", err);
    }
  };

  const addStopField = () => {
    if (stops.length >= 3) return; // Limit to 3 stops
    setStops([...stops, null]);
    setActiveInputIndex(stops.length);
    setQuery("");
  };

  const removeStopField = (index) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
    setActiveInputIndex(-1);
    setQuery("");
  };

  const handleConfirmRoute = () => {
    if (!destination) return;
    
    // Filter out empty stops
    const validStops = stops.filter(s => s !== null).map((s, index) => ({
      ...s,
      order: index,
      status: "pending"
    }));

    onSelect({
      ...destination,
      stops: validStops
    });
    onClose();
  };

  const filtered = query.length > 0 && suggestions.length === 0
    ? POPULAR_LOCATIONS.filter(l =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.address.toLowerCase().includes(query.toLowerCase())
      )
    : suggestions.length > 0 ? [] : POPULAR_LOCATIONS;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-background z-50 flex flex-col max-w-md mx-auto"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Header & Inputs */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={onClose}>
                  <X className="w-6 h-6 text-foreground" />
                </button>
                <h2 className="font-heading font-semibold text-lg">Plan your Route</h2>
              </div>
              {/* Only show Done button if there are intermediate stops */}
              {stops.length > 0 && destination && (
                <Button 
                  onClick={handleConfirmRoute}
                  className="bg-primary text-primary-foreground font-heading font-semibold text-xs px-4 py-1.5 rounded-xl animate-fade-in"
                >
                  Done
                </Button>
              )}
            </div>

            <div className="space-y-3 relative">
              {/* Vertical line indicator - Only show if there are stops */}
              {stops.length > 0 && (
                <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border flex flex-col justify-between items-center py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {stops.map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  ))}
                  <div className="w-1.5 h-1.5 bg-destructive rounded-sm" />
                </div>
              )}

              {/* Main Destination Input (Always on top for simplicity) */}
              <div className={`flex items-center gap-3 relative ${stops.length > 0 ? "pl-10" : ""}`}>
                <div className="flex-1">
                  <Input
                    placeholder="Where to? (Final Destination)"
                    value={activeInputIndex === -1 ? query : (destination?.name || "")}
                    onFocus={() => {
                      setActiveInputIndex(-1);
                      setQuery(destination?.name || "");
                    }}
                    onChange={(e) => activeInputIndex === -1 && setQuery(e.target.value)}
                    className={`bg-secondary border-none h-11 text-foreground placeholder:text-muted-foreground text-sm rounded-xl font-medium ${
                      activeInputIndex === -1 ? "ring-2 ring-primary/40" : ""
                    }`}
                    autoFocus={activeInputIndex === -1}
                  />
                </div>
                {stops.length === 0 && (
                  <button 
                    onClick={addStopField}
                    className="p-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Stop</span>
                  </button>
                )}
              </div>

              {/* Intermediate Stops - Shown dynamically */}
              {stops.map((stop, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3 pl-10 relative"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex-1 relative">
                    <Input
                      placeholder={`Stop ${index + 1}`}
                      value={activeInputIndex === index ? query : (stop?.name || "")}
                      onFocus={() => {
                        setActiveInputIndex(index);
                        setQuery(stop?.name || "");
                      }}
                      onChange={(e) => activeInputIndex === index && setQuery(e.target.value)}
                      className={`bg-secondary border-none h-11 text-foreground placeholder:text-muted-foreground text-sm rounded-xl ${
                        activeInputIndex === index ? "ring-2 ring-primary/40" : ""
                      }`}
                      autoFocus={activeInputIndex === index}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => removeStopField(index)}
                      className="p-2 hover:bg-secondary rounded-xl transition-colors text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {index === stops.length - 1 && stops.length < 3 && (
                      <button 
                        onClick={addStopField}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Results Suggestions */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {!loading && suggestions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Suggestions</p>
                <div className="space-y-1">
                  {suggestions.map((place) => (
                    <button
                      key={place.place_id}
                      onClick={() => handleSelectPlace(place.place_id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-sm text-foreground">{place.structured_formatting?.main_text || place.description}</p>
                        <p className="text-xs text-muted-foreground">{place.structured_formatting?.secondary_text || ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <>
                {/* Saved Places - Home/Work (Uber/Bolt style) */}
                {!query && savedPlaces.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">Saved Places</p>
                    <div className="space-y-1">
                      {savedPlaces.filter(p => p.lat && p.lng).map((place, i) => {
                        const lower = place.name.toLowerCase();
                        const Icon = lower === "home" ? Home : lower === "work" ? Briefcase : Star;
                        return (
                          <button
                            key={i}
                            onClick={() => handleSelectLocation(place)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-medium text-sm text-foreground">{place.name}</p>
                              <p className="text-xs text-muted-foreground">{place.address}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Search History */}
                {!query && searchHistory.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Recent Searches</p>
                      <button onClick={() => { localStorage.removeItem("destinationSearchHistory"); setSearchHistory([]); }} className="text-xs text-destructive hover:underline">
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.map((location, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectLocation(location)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-medium text-sm text-foreground">{location.name}</p>
                            <p className="text-xs text-muted-foreground">{location.address}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Places */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">
                    {query ? "Popular Places" : "Popular Destinations"}
                  </p>
                  <div className="space-y-1">
                    {filtered.map((location, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectLocation(location)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium text-sm text-foreground">{location.name}</p>
                          <p className="text-xs text-muted-foreground">{location.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
