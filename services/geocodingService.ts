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

export interface ReverseGeocodeResult {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'QuickNurseDemo/1.0'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.address) {
      return {
        street: data.address.road || data.address.house_number ? `${data.address.house_number || ''} ${data.address.road || ''}`.trim() : undefined,
        city: data.address.city || data.address.town || data.address.village,
        state: data.address.state || data.address.region,
        zip: data.address.postcode,
      };
    }
    return null;
  } catch {
    return null;
  }
}
