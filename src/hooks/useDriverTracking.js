import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Smoothly interpolates driver position toward a target, writing coordinates
 * to the DriverProfile entity so the rider can poll them in real-time.
 *
 * @param {object} opts
 *   driverProfileId – DriverProfile record id (driver side only, omit on rider side)
 *   rideId          – current Ride id (both sides)
 *   pickupLat/Lng   – pickup coordinates
 *   destLat/Lng     – destination coordinates
 *   status          – current ride status
 *   startLat/Lng    – driver's real GPS position (driver side)
 */
export function useDriverTracking({
  driverProfileId,
  rideId,
  pickupLat, pickupLng,
  destLat, destLng,
  status,
  startLat, startLng,
  isDriver = false,
}) {
  const [driverPos, setDriverPos] = useState(
    startLat && startLng ? [startLat, startLng] : null
  );
  const posRef = useRef(driverPos);
  posRef.current = driverPos;

  // ── Driver side: simulate smooth movement & persist to entity ──
  useEffect(() => {
    if (!isDriver || !driverProfileId) return;
    if (status !== "matched" && status !== "driver_arriving" && status !== "in_progress") return;

    const targetLat = status === "in_progress" ? destLat : pickupLat;
    const targetLng = status === "in_progress" ? destLng : pickupLng;
    if (!targetLat || !targetLng) return;

    // Initialise position if we don't have one yet
    if (!posRef.current) {
      const init = startLat && startLng
        ? [startLat, startLng]
        : [targetLat + 0.008, targetLng + 0.006];
      setDriverPos(init);
      posRef.current = init;
    }

    const STEPS = 120; // ~2 min at 1s intervals
    let step = 0;

    const interval = setInterval(async () => {
      const [curLat, curLng] = posRef.current || [targetLat, targetLng];
      const t = Math.min((step + 1) / STEPS, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const newLat = curLat + (targetLat - curLat) * 0.04 + (Math.random() - 0.5) * 0.0002;
      const newLng = curLng + (targetLng - curLng) * 0.04 + (Math.random() - 0.5) * 0.0002;

      setDriverPos([newLat, newLng]);

      // Persist to DriverProfile so rider can read it
      await base44.entities.DriverProfile.update(driverProfileId, {
        current_lat: newLat,
        current_lng: newLng,
      });

      step++;
      if (step >= STEPS) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [isDriver, driverProfileId, status, pickupLat, pickupLng, destLat, destLng]);

  // ── Rider side: poll DriverProfile for live position ──
  useEffect(() => {
    if (isDriver || !rideId) return;
    if (status !== "matched" && status !== "driver_arriving" && status !== "in_progress") return;

    const poll = setInterval(async () => {
      const rides = await base44.entities.Ride.filter({ id: rideId });
      if (!rides.length) return;
      const dId = rides[0].driver_id;
      if (!dId) return;
      const drivers = await base44.entities.DriverProfile.filter({ user_id: dId });
      if (drivers.length > 0) {
        const { current_lat, current_lng } = drivers[0];
        if (current_lat && current_lng) setDriverPos([current_lat, current_lng]);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [isDriver, rideId, status]);

  return driverPos;
}