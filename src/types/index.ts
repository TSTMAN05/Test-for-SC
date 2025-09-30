// Core types for the application (no database dependencies)

export interface Attorney {
  id: number;
  name: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  distance?: number; // Distance from search location in miles
}

export interface SearchLocation {
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
}