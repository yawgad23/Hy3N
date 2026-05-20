import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Home, Briefcase, MapPin, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SavedPlaces({ onSelect }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [newPlace, setNewPlace] = useState({ name: "", address: "", lat: null, lng: null });

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

  const handleSavePlace = async () => {
    if (!newPlace.name || !newPlace.address) {
      toast({ title: "Missing info", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const updatedLocations = editingPlace
      ? savedLocations.map((loc, idx) => idx === editingPlace ? { ...newPlace } : loc)
      : [...savedLocations, newPlace];

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

    toast({ title: editingPlace ? "Place updated" : "Place saved", description: newPlace.address });
    setShowAddDialog(false);
    setEditingPlace(null);
    setNewPlace({ name: "", address: "", lat: null, lng: null });
    
    // Refresh profile
    const profiles = await base44.entities.RiderProfile.filter({ user_id: user.id });
    if (profiles.length > 0) setProfile(profiles[0]);
  };

  const handleDeletePlace = async (index) => {
    const updatedLocations = savedLocations.filter((_, idx) => idx !== index);
    await base44.entities.RiderProfile.update(profile.id, { saved_locations: updatedLocations });
    toast({ title: "Place removed", description: "Your saved place has been removed" });
    
    // Refresh profile
    const profiles = await base44.entities.RiderProfile.filter({ user_id: user.id });
    if (profiles.length > 0) setProfile(profiles[0]);
  };

  const getIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower === "home") return <Home className="w-5 h-5 text-primary" />;
    if (lower === "work") return <Briefcase className="w-5 h-5 text-primary" />;
    return <MapPin className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg">Saved Places</h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingPlace ? "Edit Place" : "Add New Place"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Home, Work, Gym"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  className="bg-secondary"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  placeholder="Enter full address"
                  value={newPlace.address}
                  onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                  className="bg-secondary"
                />
              </div>
              <Button onClick={handleSavePlace} className="w-full">
                {editingPlace ? "Update" : "Save Place"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {savedLocations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No saved places yet</p>
      ) : (
        <div className="space-y-2">
          {savedLocations.map((place, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                {getIcon(place.name)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{place.name}</p>
                <p className="text-xs text-muted-foreground truncate">{place.address}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingPlace(index);
                    setNewPlace(place);
                    setShowAddDialog(true);
                  }}
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDeletePlace(index)}
                  className="p-2 hover:bg-destructive/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
                {onSelect && (
                  <button
                    onClick={() => onSelect(place)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
                  >
                    Use
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}