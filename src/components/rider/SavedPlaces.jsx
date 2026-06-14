import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Home, Briefcase, MapPin, Plus, Trash2, Edit2, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PLACE_PRESETS = [
  { label: "Home", icon: Home, placeholder: "Enter your home address" },
  { label: "Work", icon: Briefcase, placeholder: "Enter your work address" },
];

export default function SavedPlaces({ onSelect }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [newPlace, setNewPlace] = useState({ name: "", address: "", lat: null, lng: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [presetMode, setPresetMode] = useState(null); // "Home" or "Work" or null for custom

  useEffect(() => {
    async function load() {
      const me = await base44.auth.me();
      setUser(me);
      if (me) {
        const profiles = await base44.entities.RiderProfile.filter({ user_id: me.id });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      }
    }
    load();
  }, []);

  const savedLocations = profile?.saved_locations || [];

  // Search for places using Google Places API
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke("placesAutocomplete", { query: searchQuery });
        setSuggestions(res.data?.predictions || []);
      } catch (err) {
        console.error("Places search error:", err);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select a place from suggestions
  const handleSelectSuggestion = async (place) => {
    try {
      const res = await base44.functions.invoke("placeDetails", { placeId: place.place_id });
      const data = res.data?.result;
      if (data && data.geometry) {
        const selectedPlace = {
          name: presetMode || newPlace.name || data.name,
          address: data.formatted_address || data.name,
          lat: data.geometry.location.lat,
          lng: data.geometry.location.lng
        };
        setNewPlace(selectedPlace);
        setSearchQuery(data.formatted_address || data.name);
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Place details error:", err);
      toast.error("Failed to get place details");
    }
  };

  const handleSavePlace = async () => {
    if (!newPlace.name || !newPlace.address) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!newPlace.lat || !newPlace.lng) {
      toast.error("Please select an address from the suggestions");
      return;
    }

    let updatedLocations;
    if (editingPlace !== null) {
      updatedLocations = savedLocations.map((loc, idx) => idx === editingPlace ? { ...newPlace } : loc);
    } else {
      // Check if a place with the same name already exists (for Home/Work)
      const existingIndex = savedLocations.findIndex(
        loc => loc.name.toLowerCase() === newPlace.name.toLowerCase()
      );
      if (existingIndex >= 0) {
        updatedLocations = savedLocations.map((loc, idx) => idx === existingIndex ? { ...newPlace } : loc);
      } else {
        updatedLocations = [...savedLocations, newPlace];
      }
    }

    try {
      if (profile) {
        await base44.entities.RiderProfile.update(profile.id, { saved_locations: updatedLocations });
      } else {
        await base44.entities.RiderProfile.create({ 
          user_id: user.id, 
          full_name: user.full_name, 
          phone: "", 
          saved_locations: [newPlace] 
        });
      }

      toast.success(editingPlace !== null ? "Place updated" : "Place saved");
      setShowAddDialog(false);
      setEditingPlace(null);
      setNewPlace({ name: "", address: "", lat: null, lng: null });
      setSearchQuery("");
      setPresetMode(null);
      
      // Refresh profile
      const profiles = await base44.entities.RiderProfile.filter({ user_id: user.id });
      if (profiles.length > 0) setProfile(profiles[0]);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save place");
    }
  };

  const handleDeletePlace = async (index) => {
    const updatedLocations = savedLocations.filter((_, idx) => idx !== index);
    await base44.entities.RiderProfile.update(profile.id, { saved_locations: updatedLocations });
    toast.success("Place removed");
    
    // Refresh profile
    const profiles = await base44.entities.RiderProfile.filter({ user_id: user.id });
    if (profiles.length > 0) setProfile(profiles[0]);
  };

  const openAddDialog = (preset = null) => {
    setPresetMode(preset);
    if (preset) {
      const existing = savedLocations.find(l => l.name.toLowerCase() === preset.toLowerCase());
      if (existing) {
        setNewPlace(existing);
        setSearchQuery(existing.address);
        setEditingPlace(savedLocations.indexOf(existing));
      } else {
        setNewPlace({ name: preset, address: "", lat: null, lng: null });
        setSearchQuery("");
        setEditingPlace(null);
      }
    } else {
      setNewPlace({ name: "", address: "", lat: null, lng: null });
      setSearchQuery("");
      setEditingPlace(null);
    }
    setShowAddDialog(true);
  };

  const getIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower === "home") return <Home className="w-5 h-5 text-primary" />;
    if (lower === "work") return <Briefcase className="w-5 h-5 text-primary" />;
    return <Star className="w-5 h-5 text-primary" />;
  };

  const homePlace = savedLocations.find(l => l.name.toLowerCase() === "home");
  const workPlace = savedLocations.find(l => l.name.toLowerCase() === "work");
  const otherPlaces = savedLocations.filter(l => l.name.toLowerCase() !== "home" && l.name.toLowerCase() !== "work");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg">Saved Places</h3>
      </div>

      {/* Home & Work Presets - Always show (like Uber/Bolt) */}
      <div className="space-y-2">
        {/* Home */}
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Home</p>
            {homePlace ? (
              <p className="text-xs text-muted-foreground truncate">{homePlace.address}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Add your home address</p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => openAddDialog("Home")}
              className="p-2 hover:bg-secondary rounded-lg"
            >
              {homePlace ? <Edit2 className="w-4 h-4 text-muted-foreground" /> : <Plus className="w-4 h-4 text-primary" />}
            </button>
            {homePlace && onSelect && (
              <button
                onClick={() => onSelect(homePlace)}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
              >
                Go
              </button>
            )}
          </div>
        </div>

        {/* Work */}
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Work</p>
            {workPlace ? (
              <p className="text-xs text-muted-foreground truncate">{workPlace.address}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Add your work address</p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => openAddDialog("Work")}
              className="p-2 hover:bg-secondary rounded-lg"
            >
              {workPlace ? <Edit2 className="w-4 h-4 text-muted-foreground" /> : <Plus className="w-4 h-4 text-primary" />}
            </button>
            {workPlace && onSelect && (
              <button
                onClick={() => onSelect(workPlace)}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
              >
                Go
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Other Saved Places */}
      {otherPlaces.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Favorites</p>
          {otherPlaces.map((place, index) => {
            const realIndex = savedLocations.indexOf(place);
            return (
              <div
                key={realIndex}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{place.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingPlace(realIndex);
                      setNewPlace(place);
                      setSearchQuery(place.address);
                      setPresetMode(null);
                      setShowAddDialog(true);
                    }}
                    className="p-2 hover:bg-secondary rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeletePlace(realIndex)}
                    className="p-2 hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(place)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
                    >
                      Go
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Place Button */}
      <Button 
        variant="outline" 
        className="w-full gap-2 border-dashed"
        onClick={() => openAddDialog(null)}
      >
        <Plus className="w-4 h-4" />
        Add New Place
      </Button>

      {/* Add/Edit Dialog with Search */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setPresetMode(null);
          setEditingPlace(null);
          setSearchQuery("");
          setSuggestions([]);
        }
      }}>
        <DialogContent className="bg-card border-border max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {presetMode ? `Set ${presetMode} Address` : editingPlace !== null ? "Edit Place" : "Add New Place"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 flex-1 overflow-y-auto">
            {/* Name field (hidden for presets) */}
            {!presetMode && (
              <div>
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input
                  placeholder="e.g., Gym, Church, School"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  className="bg-secondary mt-1"
                />
              </div>
            )}

            {/* Address Search */}
            <div>
              <Label className="text-xs text-muted-foreground">Address</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={presetMode ? `Search for your ${presetMode.toLowerCase()} address` : "Search for an address"}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Clear lat/lng when user types new query
                    if (newPlace.lat) {
                      setNewPlace({ ...newPlace, address: "", lat: null, lng: null });
                    }
                  }}
                  className="bg-secondary pl-9"
                />
              </div>
              
              {/* Search Results */}
              {searching && (
                <div className="flex items-center justify-center py-3">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {suggestions.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-secondary">
                  {suggestions.map((place) => (
                    <button
                      key={place.place_id}
                      onClick={() => handleSelectSuggestion(place)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-background/50 transition-colors border-b border-border last:border-b-0"
                    >
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{place.structured_formatting?.main_text || place.description}</p>
                        <p className="text-xs text-muted-foreground truncate">{place.structured_formatting?.secondary_text || ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected address confirmation */}
              {newPlace.lat && newPlace.lng && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-ghana-green/10 border border-ghana-green/30 rounded-lg">
                  <MapPin className="w-4 h-4 text-ghana-green flex-shrink-0" />
                  <p className="text-xs text-ghana-green font-medium truncate">{newPlace.address}</p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleSavePlace} 
              className="w-full"
              disabled={!newPlace.lat || !newPlace.lng || (!presetMode && !newPlace.name)}
            >
              {editingPlace !== null ? "Update" : `Save ${presetMode || "Place"}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
