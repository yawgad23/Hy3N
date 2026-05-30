import { useState, useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { RIDE_CATEGORIES, FREE_WAITING_MINUTES } from "@/lib/constants";

/**
 * WaitingTimer - Displays a live waiting timer and accumulated fee.
 * 
 * Props:
 * - arrivedAt: ISO string when driver pressed "I've Arrived"
 * - category: ride category id (to look up waitingFeePerMin)
 * - isDriver: boolean - shows different messaging for driver vs rider
 * - compact: boolean - smaller display variant
 */
export default function WaitingTimer({ arrivedAt, category, isDriver = false, compact = false }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  const categoryConfig = RIDE_CATEGORIES.find(c => c.id === category) || RIDE_CATEGORIES[0];
  const waitingFeePerMin = categoryConfig.waitingFeePerMin || 0.50;
  const freeMinutes = FREE_WAITING_MINUTES;

  useEffect(() => {
    if (!arrivedAt) return;

    const arrivalTime = new Date(arrivedAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - arrivalTime) / 1000);
      setElapsedSeconds(Math.max(0, elapsed));
    };

    updateTimer(); // Initial update
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [arrivedAt]);

  if (!arrivedAt) return null;

  const totalMinutes = elapsedSeconds / 60;
  const freeSecondsTotal = freeMinutes * 60;
  const chargeableMinutes = Math.max(0, totalMinutes - freeMinutes);
  const currentFee = parseFloat((chargeableMinutes * waitingFeePerMin).toFixed(2));
  const isCharging = elapsedSeconds > freeSecondsTotal;

  // Format time display
  const displayMinutes = Math.floor(elapsedSeconds / 60);
  const displaySeconds = elapsedSeconds % 60;
  const timeString = `${displayMinutes}:${displaySeconds.toString().padStart(2, "0")}`;

  // Remaining free time
  const freeTimeRemaining = Math.max(0, freeSecondsTotal - elapsedSeconds);
  const freeMinRemaining = Math.floor(freeTimeRemaining / 60);
  const freeSecRemaining = freeTimeRemaining % 60;
  const freeTimeString = `${freeMinRemaining}:${freeSecRemaining.toString().padStart(2, "0")}`;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
        isCharging ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"
      }`}>
        <Clock className="w-3.5 h-3.5" />
        <span>{timeString}</span>
        {isCharging && <span className="font-bold">+GH₵{currentFee.toFixed(2)}</span>}
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-3 border ${
      isCharging 
        ? "bg-destructive/5 border-destructive/30" 
        : "bg-amber-500/5 border-amber-500/30"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCharging ? "bg-destructive/20" : "bg-amber-500/20"
          }`}>
            {isCharging ? (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div>
            <p className={`text-xs font-medium ${isCharging ? "text-destructive" : "text-amber-600"}`}>
              {isCharging 
                ? (isDriver ? "Waiting Fee Active" : "Waiting Fee Charging") 
                : (isDriver ? "Waiting for Rider" : "Driver is Waiting")
              }
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isCharging 
                ? `GH₵${waitingFeePerMin.toFixed(2)}/min after ${freeMinutes} min free`
                : `Free for ${freeTimeString} more`
              }
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-heading font-bold text-lg ${isCharging ? "text-destructive" : "text-foreground"}`}>
            {timeString}
          </p>
          {isCharging && (
            <p className="text-xs font-bold text-destructive">+GH₵{currentFee.toFixed(2)}</p>
          )}
        </div>
      </div>
      {/* Progress bar showing free time usage */}
      {!isCharging && (
        <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (elapsedSeconds / freeSecondsTotal) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
