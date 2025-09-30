interface GeocodeResult {
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  city: string;
  state: string;
  zipCode: string;
}

export class GeocodingService {
  private static mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!this.mapboxToken || !address.trim()) {
      return null;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
        `access_token=${this.mapboxToken}&` +
        `country=US&` +
        `types=address,poi&` +
        `limit=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      const feature = data.features?.[0];

      if (!feature) {
        return null;
      }

      // Extract address components
      const context = feature.context || [];
      const getContextValue = (type: string) => {
        const item = context.find((c: any) => c.id.startsWith(type));
        return item?.text || '';
      };

      return {
        address: feature.place_name,
        coordinates: feature.center,
        city: getContextValue('place'),
        state: getContextValue('region'),
        zipCode: getContextValue('postcode')
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  // Calculate distance between two points using Haversine formula
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}