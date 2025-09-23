// Location utilities for calculating distances and managing location data

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  accuracy?: number;
  timestamp?: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number, language: 'en' | 'hi'): string {
  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return language === 'en' ? `${meters}m away` : `${meters}मी दूर`;
  }
  return language === 'en' ? `${distance}km away` : `${distance}किमी दूर`;
}

/**
 * Get user's current location
 */
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
}

// Real coordinates for Indian cities used in mock data
export const CITY_COORDINATES: Record<string, Coordinates> = {
  // Delhi locations
  'Connaught Place, Delhi': { latitude: 28.6315, longitude: 77.2167 },
  'Lajpat Nagar, Delhi': { latitude: 28.5653, longitude: 77.2430 },
  'Karol Bagh, Delhi': { latitude: 28.6519, longitude: 77.1909 },
  
  // Mumbai locations
  'Bandra, Mumbai': { latitude: 19.0596, longitude: 72.8295 },
  'Andheri, Mumbai': { latitude: 19.1136, longitude: 72.8697 },
  
  // Bangalore locations
  'Koramangala, Bangalore': { latitude: 12.9352, longitude: 77.6245 },
  'Whitefield, Bangalore': { latitude: 12.9698, longitude: 77.7500 },
  
  // Noida locations
  'Sector 18, Noida': { latitude: 28.5678, longitude: 77.3261 },
};