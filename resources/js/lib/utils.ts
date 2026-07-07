import { weatherCodeMapping } from '@/constant/mapping';
import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
  return typeof url === 'string' ? url : url.url;
}

export async function getWeatherString(lat: string, lon: string) {
  try {
    // 2. Fetch data directly from the free API endpoint (No key required!)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
    const response = await fetch(url);
    const data = await response.json();

    // 3. Extract variables
    const temp = Math.round(data.current.temperature_2m); // returns 33
    const code = data.current.weather_code;

    // 4. Fallback if code isn't in our quick-list dictionary
    const condition = weatherCodeMapping[code] || 'Unknown Conditions';

    // 5. Output your perfectly formatted string
    return `${temp}°C — ${condition}`;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return "Weather unavailable";
  }
}

export async function getLocationName(lat: string, lon: string) {
  try {
    // 1. Fetch from OpenStreetMap's free Nominatim engine
    // IMPORTANT: The API requires a custom User-Agent header so they know who is calling it
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MyWeatherApp/1.0 (contact@example.com)' // Put your app name here
      }
    });

    const data = await response.json();

    // 2. Break down the breakdown components
    const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
    const country = data.address.country;

    if (city && country) {
      return `${city}, ${country}`;
    } else if (data.display_name) {
      // Fallback if it's a remote area with no explicit city boundary
      return data.display_name.split(',').slice(0, 2).join(',');
    }

    return "Unknown Location";
  } catch (error) {
    console.error("Failed to fetch location:", error);
    return "Location unavailable";
  }
}

export async function getLocalTimezone(lat: string, lon: string): Promise<string | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();

    // Returns the exact IANA Timezone identifier string (e.g., "Asia/Karachi")
    return data.timezone;
  } catch (error) {
    console.error("Failed to fetch timezone:", error);
    return null;
  }
}

export function toSafeURL(string: string) {
  return string.toLowerCase().replace(/\s+/g, '-');
}