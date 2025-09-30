import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Attorney {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  coordinates: [number, number]; // [longitude, latitude]
  distance?: number; // Distance from search location in miles
}

interface MapboxMapProps {
  attorneys: Attorney[];
  searchLocation?: {
    address: string;
    coordinates: [number, number];
  };
  onAttorneySelect?: (attorney: Attorney) => void;
}

export default function MapboxMap({ attorneys, searchLocation, onAttorneySelect }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const searchMarker = useRef<mapboxgl.Marker | null>(null);

  // Add global function for contact firm button
  useEffect(() => {
    (window as any).contactFirm = (attorneyId: string) => {
      const attorney = attorneys.find(a => a.id.toString() === attorneyId);
      if (attorney) {
        // You can customize this action - for now it will show an alert
        // Later this could open a contact modal, navigate to a contact page, etc.
        alert(`Contacting ${attorney.name}\n\nPhone: ${attorney.phone}\nEmail: ${attorney.email}`);
        
        // Optional: You could also trigger the onAttorneySelect callback
        if (onAttorneySelect) {
          onAttorneySelect(attorney);
        }
      }
    };

    // Cleanup function
    return () => {
      delete (window as any).contactFirm;
    };
  }, [attorneys, onAttorneySelect]);

  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      console.error('Mapbox access token is required');
      return;
    }

    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Initialize map - center on search location if available, otherwise Charlotte
    const center = searchLocation?.coordinates || [-80.8431, 35.2271];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: searchLocation ? 12 : 11,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add attribution control at bottom right
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true
    }), 'bottom-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Close popups when clicking on the map (not on markers)
    map.current.on('click', (e) => {
      // Check if the click was on a marker by looking for our marker classes
      const features = map.current!.queryRenderedFeatures(e.point);
      const clickedOnMarker = e.originalEvent.target && 
        (e.originalEvent.target as HTMLElement).closest('.attorney-marker, .search-marker');
      
      // If not clicked on a marker, close all popups
      if (!clickedOnMarker) {
        // Get all popups and close them
        const popups = document.querySelectorAll('.mapboxgl-popup');
        popups.forEach(popup => {
          const closeButton = popup.querySelector('.mapboxgl-popup-close-button') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        });
      }
    });
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (searchMarker.current) {
        searchMarker.current.remove();
        searchMarker.current = null;
      }
    };
  }, []);

  // Add search location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !searchLocation) return;

    // Remove existing search marker
    if (searchMarker.current) {
      searchMarker.current.remove();
    }

    // Create search location marker (red pin)
    const searchElement = document.createElement('div');
    searchElement.className = 'search-marker';
    searchElement.style.cssText = `
      width: 30px;
      height: 40px;
      background: #dc2626;
      border: 2px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      position: relative;
    `;

    // Add inner dot
    const innerDot = document.createElement('div');
    innerDot.style.cssText = `
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    searchElement.appendChild(innerDot);

    // Create popup for search location
    const searchPopup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false
    }).setHTML(`
      <div class="p-3">
        <div class="flex items-center space-x-2 mb-2">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <h3 class="font-semibold text-red-600">You are here</h3>
        </div>
        <p class="text-sm text-gray-600">${searchLocation.address}</p>
      </div>
    `);

    searchMarker.current = new mapboxgl.Marker(searchElement)
      .setLngLat(searchLocation.coordinates)
      .setPopup(searchPopup)
      .addTo(map.current);

  }, [searchLocation, mapLoaded]);

  // Add search location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !searchLocation) return;

    // Remove existing search marker
    if (searchMarker.current) {
      searchMarker.current.remove();
    }

    // Create search location marker (red pin)
    const searchElement = document.createElement('div');
    searchElement.className = 'search-marker';
    searchElement.style.cssText = `
      width: 30px;
      height: 40px;
      background: #dc2626;
      border: 2px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      position: relative;
    `;

    // Add inner dot
    const innerDot = document.createElement('div');
    innerDot.style.cssText = `
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    searchElement.appendChild(innerDot);

    // Create popup for search location
    const searchPopup = new mapboxgl.Popup({
      offset: 25,
      closeButton: true,
      closeOnClick: false
    }).setHTML(`
      <div class="p-3">
        <h3 class="font-semibold text-gray-900 mb-2">Search Location</h3>
        <p class="text-sm text-gray-600">${searchLocation.address}</p>
      </div>
    `);

    searchMarker.current = new mapboxgl.Marker(searchElement)
      .setLngLat(searchLocation.coordinates)
      .setPopup(searchPopup)
      .addTo(map.current);

  }, [searchLocation, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded || attorneys.length === 0) return;

    // Clear existing attorney markers (but keep search marker)
    const existingMarkers = document.querySelectorAll('.attorney-marker');
    existingMarkers.forEach(marker => {
      const parentMarker = marker.closest('.mapboxgl-marker');
      if (parentMarker) {
        parentMarker.remove();
      }
    });

    // Add markers for each attorney
    attorneys.forEach((attorney) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'attorney-marker';
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        background: #2563eb;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      `;
      markerElement.textContent = attorney.rating.toString();

      // Create popup content
      const popupContent = `
        <div class="p-3 max-w-xs">
          <h3 class="font-semibold text-gray-900 mb-2">${attorney.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${attorney.address}</p>
          ${attorney.distance ? `<p class="text-sm text-blue-600 mb-2">${attorney.distance.toFixed(1)} miles away</p>` : ''}
          <div class="flex items-center mb-2">
            <span class="text-yellow-500">★</span>
            <span class="text-sm font-medium ml-1">${attorney.rating}</span>
            <span class="text-sm text-gray-500 ml-1">(${attorney.reviewCount} reviews)</span>
          </div>
          <div class="flex flex-wrap gap-1 mb-3">
            ${attorney.specialties.map(specialty => 
              `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${specialty}</span>`
            ).join('')}
          </div>
          <div class="space-y-1 text-sm">
            <p class="text-gray-600">${attorney.phone}</p>
            <p class="text-gray-600">${attorney.email}</p>
          </div>
          <div class="mt-4">
            <button 
              onclick="window.contactFirm('${attorney.id}')" 
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Firm
            </button>
          </div>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupContent);

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(attorney.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      // Handle marker click
      markerElement.addEventListener('click', () => {
        if (onAttorneySelect) {
          onAttorneySelect(attorney);
        }
      });
    });

    // Fit map to show all markers if there are any
    if (attorneys.length > 0 || searchLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Include search location in bounds
      if (searchLocation) {
        bounds.extend(searchLocation.coordinates);
      }
      
      // Include search location in bounds
      if (searchLocation) {
        bounds.extend(searchLocation.coordinates);
      }
      
      // Include all attorney locations
      attorneys.forEach(attorney => {
        bounds.extend(attorney.coordinates);
      });
      
      map.current.fitBounds(bounds, {
        padding: 80,
        maxZoom: 14
      });
    }
  }, [attorneys, searchLocation, mapLoaded, onAttorneySelect]);

  if (!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Mapbox Token Required
          </h3>
          <p className="text-gray-600 text-sm">
            Please add your Mapbox access token to the environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div ref={mapContainer} className="h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}