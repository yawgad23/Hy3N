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

  // ── Driver side: use real GPS + persist position to entity for rider ──
  useEffect(() => {
    if (!isDriver || !driverProfileId) return;
    if (status !== "matched" && status !== "driver_arriving" && status !== "in_progress") return;

    // Seed initial position from props
    if (startLat && startLng && !posRef.current) {
      setDriverPos([startLat, startLng]);
      posRef.current = [startLat, startLng];
    }

    let watchId = null;
    let lastPersistTime = 0;

    const persistPosition = async (lat, lng) => {
      const now = Date.now();
      if (now - lastPersistTime < 3000) return; // persist at most every 3s
      lastPersistTime = now;
      setDriverPos([lat, lng]);
      await base44.entities.DriverProfile.update(driverProfileId, {
        current_lat: lat,
        current_lng: lng,
      });
    };

    if (navigator.geolocation) {
      // Use watchPosition for real-time GPS updates
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          posRef.current = [latitude, longitude];
          persistPosition(latitude, longitude);
        },
        () => {
          // GPS unavailable — fall back to simulation toward target
          startSimulation();
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
      );
    } else {
      startSimulation();
    }

    function startSimulation() {
      const targetLat = status === "in_progress" ? destLat : pickupLat;
      const targetLng = status === "in_progress" ? destLng : pickupLng;
      if (!targetLat || !targetLng) return;

      if (!posRef.current) {
        posRef.current = [targetLat + 0.008, targetLng + 0.006];
        setDriverPos(posRef.current);
      }

      const interval = setInterval(async () => {
        const [curLat, curLng] = posRef.current;
        const newLat = curLat + (targetLat - curLat) * 0.04 + (Math.random() - 0.5) * 0.0002;
        const newLng = curLng + (targetLng - curLng) * 0.04 + (Math.random() - 0.5) * 0.0002;
        posRef.current = [newLat, newLng];
        persistPosition(newLat, newLng);
      }, 3000);

      // Store interval id for cleanup via a ref trick
      persistPosition._simInterval = interval;
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (persistPosition._simInterval) clearInterval(persistPosition._simInterval);
    };
  }, [isDriver, driverProfileId, status, pickupLat, pickupLng, destLat, destLng]);

  // ── Rider side: real-time subscription to DriverProfile updates ──
  useEffect(() => {
    if (isDriver || !rideId) return;
    if (status !== "matched" && status !== "driver_arriving" && status !== "in_progress") return;

    let resolvedProfileId = null;
    let unsubscribe = () => {};

    const setup = async () => {
      // Fetch ride to get driver_id
      const rides = await base44.entities.Ride.filter({ id: rideId });
      if (!rides.length) return;
      const driverId = rides[0].driver_id;
      if (!driverId) return;

      // Fetch driver profile to seed initial position
      const drivers = await base44.entities.DriverProfile.filter({ user_id: driverId });
      if (!drivers.length) return;

      resolvedProfileId = drivers[0].id;
      const { current_lat, current_lng } = drivers[0];
      if (current_lat && current_lng) setDriverPos([current_lat, current_lng]);

      // Subscribe — only react to updates on this specific driver's profile
      unsubscribe = base44.entities.DriverProfile.subscribe((event) => {
        if (
          event.type === "update" &&
          event.id === resolvedProfileId &&
          event.data?.current_lat &&
          event.data?.current_lng
        ) {
          setDriverPos([event.data.current_lat, event.data.current_lng]);
        }
      });
    };

    setup();
    return () => unsubscribe();
  }, [isDriver, rideId, status]);

  return driverPos;
}