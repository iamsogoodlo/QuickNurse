export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'QuickNurseDemo/1.0'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [parseFloat(lat), parseFloat(lon)];
    }
    return null;
  } catch {
    return null;
  }
}

interface ReverseGeocodeResult {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export const reverseGeocode = async (
  _latitude: number,  // prefix with underscore to indicate intentionally unused
  _longitude: number  // prefix with underscore to indicate intentionally unused
): Promise<ReverseGeocodeResult | null> => {
  try {
    // TODO: Implement actual reverse geocoding
    return {
      street: 'Mock Street',
      city: 'Mock City',
      state: 'CA',
      zip: '12345'
    };
  } catch (error) {
    return null;
  }
};
