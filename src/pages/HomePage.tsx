import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import Layout from '../components/Layout';
import { GeocodingService } from '../services/geocodingService';

export default function HomePage() {
  const navigate = useNavigate();

  const handleSearch = async (address: string, closingDate: string) => {
    if (!address.trim()) {
      alert('Please enter a property address');
      return;
    }

    try {
      // Geocode the address to get coordinates
      const geocodeResult = await GeocodingService.geocodeAddress(address);
      
      if (!geocodeResult) {
        alert('Could not find the specified address. Please try a different address.');
        return;
      }

      // Navigate to map page with search parameters
      const searchParams = new URLSearchParams({
        address: geocodeResult.address,
        lat: geocodeResult.coordinates[1].toString(),
        lng: geocodeResult.coordinates[0].toString(),
        closingDate: closingDate
      });

      navigate(`/map?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error during search:', error);
      alert('An error occurred while searching. Please try again.');
    }
  };

  return (
    <Layout>
      <HeroSection onSearch={handleSearch} />
    </Layout>
  );
}