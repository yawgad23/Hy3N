import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  { name: "Spintex Road", address: "Accra", lat: 5.6147, lng: -0.1289 },
  { name: "Labone", address: "Accra", lat: 5.5656, lng: -0.1739 },
  { name: "Cantonments", address: "Accra", lat: 5.5789, lng: -0.1756 },
  { name: "Adabraka", address: "Accra", lat: 5.5667, lng: -0.2089 },
  { name: "Tema Community 1", address: "Tema", lat: 5.6698, lng: -0.0167 },
  { name: "Tema Harbour", address: "Tema", lat: 5.6289, lng: -0.0089 },
  { name: "Kasoa Market", address: "Kasoa", lat: 5.5347, lng: -0.4189 },
  { name: "Dansoman", address: "Accra", lat: 5.5456, lng: -0.2567 },
  { name: "Achimota", address: "Accra", lat: 5.6089, lng: -0.2289 },
  { name: "Dome", address: "Accra", lat: 5.6456, lng: -0.2389 },
  { name: "Lapaz", address: "Accra", lat: 5.5989, lng: -0.2456 },
  { name: "Kaneshie", address: "Accra", lat: 5.5756, lng: -0.2289 },
  { name: "Bubuashie", address: "Accra", lat: 5.5889, lng: -0.2356 },
  { name: "Tesano", address: "Accra", lat: 5.6089, lng: -0.2089 },
  { name: "Nima", address: "Accra", lat: 5.5889, lng: -0.1989 },
  { name: "Kanda", address: "Accra", lat: 5.5789, lng: -0.1889 },
  { name: "Ridge", address: "Accra", lat: 5.5689, lng: -0.1989 },
  { name: "Ministries", address: "Accra", lat: 5.5589, lng: -0.1889 },
  { name: "Victoriaborg", address: "Accra", lat: 5.5489, lng: -0.1789 },
  { name: "Teshie", address: "Teshie-Nungua", lat: 5.5889, lng: -0.1089 },
  { name: "Nungua", address: "Teshie-Nungua", lat: 5.6089, lng: -0.0889 },
  { name: "Ashaiman", address: "Ashaiman", lat: 5.6289, lng: -0.0389 },
  { name: "Madina", address: "Madina", lat: 5.6589, lng: -0.1689 },
  { name: "Haatso", address: "Accra", lat: 5.6489, lng: -0.1889 },
  { name: "Gbawe", address: "Accra", lat: 5.5689, lng: -0.2789 },
  { name: "Mallam", address: "Accra", lat: 5.5589, lng: -0.2689 }
];

export default function DestinationSearch({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef(null);

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

  const handleSelectPlace = async (placeId) => {
    try {
      const res = await base44.functions.invoke("placeDetails", { placeId });
      const data = res.data.result;
      if (data && data.geometry) {
        onSelect({
          name: data.name || data.formatted_address,
          address: data.formatted_address,
          lat: data.geometry.location.lat,
          lng: data.geometry.location.lng
        });
        onClose();
      }
    } catch (err) {
      console.error("Place details error:", err);
    }
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
          className="fixed inset-0 bg-background z-50 flex flex-col"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={onClose}>
                <X className="w-6 h-6 text-foreground" />
              </button>
              <h2 className="font-heading font-semibold text-lg">Where to?</h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search destination..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-secondary border-none h-12 text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {!loading && suggestions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">
                  Suggestions
                </p>
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

            {!loading && suggestions.length === 0 && filtered.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">
                  {query ? "Popular Places" : "Popular Destinations"}
                </p>
                <div className="space-y-1">
                  {filtered.map((location, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onSelect(location);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        {query ? (
                          <MapPin className="w-5 h-5 text-primary" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-foreground">{location.name}</p>
                        <p className="text-xs text-muted-foreground">{location.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!loading && suggestions.length === 0 && filtered.length === 0 && query.length > 2 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No results found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}