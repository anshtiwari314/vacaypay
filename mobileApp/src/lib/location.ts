import type { LocationGeocodedAddress } from "expo-location";
import { Platform } from "react-native";

export type SignInLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  place: string | null;
};

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("location timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function formatPlace(address: LocationGeocodedAddress) {
  const parts = [address.city || address.district || address.subregion, address.region, address.country];
  const unique: string[] = [];
  for (const part of parts) {
    const value = part?.trim();
    if (!value) continue;
    if (unique.some((item) => item.toLowerCase() === value.toLowerCase())) continue;
    unique.push(value);
  }
  return unique.join(", ") || null;
}

/**
 * Reads the device location when permission is already granted.
 * Asks once if the system has not decided yet. A denial, timeout, or missing native module returns null.
 */
export async function readGrantedLocation(): Promise<SignInLocation | null> {
  try {
    const Location = await import("expo-location");
    const current = await Location.getForegroundPermissionsAsync();
    let status = current.status;
    if (status === Location.PermissionStatus.UNDETERMINED) {
      status = (await Location.requestForegroundPermissionsAsync()).status;
    }
    if (status !== Location.PermissionStatus.GRANTED) return null;

    const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000, requiredAccuracy: 5000 });
    const position =
      lastKnown ??
      (await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        12000,
      ));

    let place: string | null = null;
    if (Platform.OS !== "web") {
      try {
        const [address] = await withTimeout(
          Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
          4000,
        );
        if (address) place = formatPlace(address);
      } catch {
        place = null;
      }
    }

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      place,
    };
  } catch {
    return null;
  }
}
