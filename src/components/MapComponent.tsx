import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Phone, Mail, Clock, Star } from 'lucide-react';
import { lawFirmService, LawFirm } from '../lib/firebase';

// Create custom blue person icon
const createBluePersonIcon = () => {
  return L.divIcon({
    className: 'custom-person-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <div style="
        position: absolute;
        top: 45px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(59, 130, 246, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        You are here
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Create attorney marker icon
const createAttorneyIcon = () => {
  return L.divIcon({
    className: 'custom-attorney-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: #dc2626;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        position: relative;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Calculate distance between two points in miles
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

interface MapComponentProps {
  searchQuery: string;
  filteredAttorneys?: Array<LawFirm & {distance: number}>;
  onLocationFound?: (location: { lat: number; lng: number; address: string }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ searchQuery, filteredAttorneys, onLocationFound }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const attorneyMarkersRef = useRef<L.Marker[]>([]);
  const lastSearchQueryRef = useRef<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([]);
  const [attorneyDistances, setAttorneyDistances] = useState<Array<LawFirm & {distance: number}>>([]);
  const { isSignedIn } = useUser();

  // Load law firms from Supabase
  useEffect(() => {
    const loadLawFirms = async () => {
      try {
        const firms = await lawFirmService.getActiveLawFirms();
        setLawFirms(firms);
      } catch (error) {
        console.error('Error loading law firms:', error);
      }
    };

    loadLawFirms();
  }, []);

  const handleContactClick = (attorneyName: string) => {
    if (!isSignedIn) {
      // Trigger Clerk's sign-in modal directly
      const signInButton = document.querySelector('[data-clerk-sign-in]') as HTMLButtonElement;
      if (signInButton) {
        signInButton.click();
      }
      return;
    }
    
    // If signed in, proceed with contact functionality
    alert(`Contacting ${attorneyName}... (This would open a contact form or redirect to contact page)`);
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('Initializing map...');
    
    // Create map centered on North Carolina
    const map = L.map(mapRef.current).setView([35.7796, -78.6382], 7);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    console.log('Map initialized successfully');

    // Add attorney markers
    addAttorneyMarkers();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add attorney markers to map
  const addAttorneyMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing attorney markers
    attorneyMarkersRef.current.forEach(marker => {
      mapInstanceRef.current!.removeLayer(marker);
    });
    attorneyMarkersRef.current = [];

    // Use filtered attorneys if provided, otherwise use all law firms
    const attorneysToShow = filteredAttorneys && filteredAttorneys.length > 0 
      ? filteredAttorneys 
      : lawFirms;

    // Add new attorney markers
    attorneysToShow.forEach(attorney => {
      const marker = L.marker([attorney.latitude, attorney.longitude], { icon: createAttorneyIcon() })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div style="padding: 10px; min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #dc2626; font-weight: bold;">${attorney.name}</h3>
            <p style="margin: 0 0 5px 0; font-size: 14px;">${attorney.street_address}, ${attorney.city}, ${attorney.state} ${attorney.zip_code}</p>
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">${attorney.phone}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">⭐ ${attorney.rating} (${attorney.reviews_count} reviews)</p>
          </div>
        `);
      attorneyMarkersRef.current.push(marker);
    });
  };

  // Handle search query changes
  useEffect(() => {
    if (!searchQuery.trim() || !mapInstanceRef.current) {
      console.log('No search query or map not ready');
      return;
    }

    // Skip if this is the same query we just searched for
    if (searchQuery === lastSearchQueryRef.current) {
      console.log('Same query as last search, skipping');
      return;
    }

    // Update the last search query to prevent duplicate searches
    lastSearchQueryRef.current = searchQuery;
    
    console.log('Starting search for:', searchQuery);
    setSearchStatus(`Searching for: ${searchQuery}`);

    const searchLocation = async () => {
      setIsLoading(true);
      
      try {
        console.log('Making API request...');
        
        // Use Nominatim API for geocoding - US only
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1&countrycodes=us&dedupe=1`;
        console.log('API URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data && data.length > 0 && data[0].address?.country_code === 'us') {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          
          console.log('Found coordinates:', { lat, lng });
          setSearchStatus(`Found: ${result.display_name}`);
          
          // Remove existing marker
          if (markerRef.current) {
            console.log('Removing existing marker');
            mapInstanceRef.current!.removeLayer(markerRef.current);
          }
          
          // Create blue person marker with popup
          console.log('Creating new marker at:', lat, lng);
          markerRef.current = L.marker([lat, lng], { icon: createBluePersonIcon() })
            .addTo(mapInstanceRef.current!)
            .bindPopup(`
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #3b82f6; font-weight: bold;">🏠 Location Found!</h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.4;">${result.display_name}</p>
                <hr style="margin: 10px 0; border: none; border-top: 1px solid #eee;">
                <p style="margin: 0; font-size: 12px; color: #666;">Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
              </div>
            `)
            .openPopup();
          
          // Update map view with 50-mile zoom (level 10)
          mapInstanceRef.current!.setView([lat, lng], 10);
          
          // Store user location for distance calculations
          setUserLocation({ lat, lng });
          
          // Calculate distances to attorneys
          const attorneysWithDistance = lawFirms.map(attorney => ({
            ...attorney,
            distance: calculateDistance(lat, lng, attorney.latitude, attorney.longitude)
          })).sort((a, b) => a.distance - b.distance);
          
          setAttorneyDistances(attorneysWithDistance);
          
          console.log('Marker created and map updated');
          
          // Notify parent component
          if (onLocationFound) {
            onLocationFound({
              lat,
              lng,
              address: result.display_name
            });
          }
          
        } else {
          console.log('No results found');
          setSearchStatus(`No results found for: ${searchQuery}`);
          
          // Show error popup at map center
          L.popup()
            .setLatLng(mapInstanceRef.current!.getCenter())
            .setContent(`
              <div style="padding: 10px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #dc2626;">❌ Address Not Found</h3>
                <p style="margin: 0; font-size: 14px;">Could not locate: "${searchQuery}"</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Please try a different address</p>
              </div>
            `)
            .openOn(mapInstanceRef.current!);
        }
      } catch (error) {
        console.error('Error searching location:', error);
        setSearchStatus(`Error searching for: ${searchQuery}`);
      } finally {
        setIsLoading(false);
      }
    };

    // Execute search immediately
    searchLocation();
  }, [searchQuery, onLocationFound]);

  // Re-add attorney markers when law firms data changes
  useEffect(() => {
    if (mapInstanceRef.current && lawFirms.length > 0) {
      addAttorneyMarkers();
    }
  }, [lawFirms, filteredAttorneys]);

  return (
    <div className="space-y-0">
      {/* Map Container */}
      <div className="relative w-full h-96 md:h-[500px] lg:h-[600px]" style={{ zIndex: 1 }}>
        <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2" style={{ zIndex: 10 }}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700 font-medium">Searching...</span>
          </div>
        )}
        
        {/* Search status */}
        {searchStatus && !isLoading && (
          <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-md shadow-lg" style={{ zIndex: 10 }}>
            <span className="text-sm text-gray-700">{searchStatus}</span>
          </div>
        )}
        
        {/* Debug info */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded text-xs" style={{ zIndex: 10 }}>
          Query: {searchQuery || 'None'} | Status: {isLoading ? 'Loading...' : 'Ready'}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;