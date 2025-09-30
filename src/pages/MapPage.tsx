import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Home } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import Footer from '../components/Footer';
import { lawFirmService, LawFirm } from '../lib/firebase';

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const searchQuery = searchParams.get('q') || '';
  const [lawFirms, setLawFirms] = React.useState<LawFirm[]>([]);
  const [attorneyDistances, setAttorneyDistances] = React.useState<Array<LawFirm & {distance: number}>>([]);
  
  const [selectedLocation, setSelectedLocation] = React.useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  // Default location (Charlotte, NC) for initial attorney distances
  const defaultLocation = { lat: 35.2271, lng: -80.8431 };

  // Load law firms from Supabase
  React.useEffect(() => {
    const loadLawFirms = async () => {
      try {
        const firms = await lawFirmService.getActiveLawFirms();
        setLawFirms(firms);
        
        // Calculate initial distances from default location (Charlotte, NC)
        if (firms.length > 0) {
          const firmsWithDistance = firms.map(firm => ({
            ...firm,
            distance: calculateDistance(defaultLocation.lat, defaultLocation.lng, firm.latitude, firm.longitude)
          })).sort((a, b) => a.distance - b.distance);
          
          setAttorneyDistances(firmsWithDistance);
        }
      } catch (error) {
        console.error('Error loading law firms:', error);
      }
    };

    loadLawFirms();
  }, []);

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

  const handleLocationFound = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    
    // Calculate distances to law firms
    if (lawFirms.length > 0) {
      const firmsWithDistance = lawFirms.map(firm => ({
        ...firm,
        distance: calculateDistance(location.lat, location.lng, firm.latitude, firm.longitude)
      })).sort((a, b) => a.distance - b.distance);
      
      setAttorneyDistances(firmsWithDistance);
    }
  };

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

  const handleScheduleClosing = () => {
    if (selectedLocation) {
      // This would typically navigate to a scheduling page or open a modal
      alert(`Schedule closing at: ${selectedLocation.address}`);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <h1 className="text-xl font-semibold text-gray-900">Find Closing Location</h1>
              </div>
            </div>
            {searchQuery && (
              <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-blue-700">Searching:</span>
                <span className="text-sm font-medium text-blue-900">"{searchQuery}"</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Search Query Display */}
        {searchQuery && (
          <div className="sm:hidden mb-6 bg-blue-50 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700">Searching:</span>
              <span className="text-sm font-medium text-blue-900">"{searchQuery}"</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <MapComponent 
              searchQuery={searchQuery} 
              filteredAttorneys={attorneyDistances}
              onLocationFound={handleLocationFound}
            />
          </div>

          {/* Attorney List - moved from MapComponent */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg h-96 md:h-[500px] lg:h-[600px] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 text-red-600 mr-2" />
                  {selectedLocation ? 'Nearby Attorneys' : 'Closest Attorneys'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedLocation 
                    ? 'Sorted by distance from your location' 
                    : 'Sorted by distance from Charlotte, NC'
                  }
                </p>
              </div>
              <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
                {attorneyDistances.length > 0 ? (
                  attorneyDistances.slice(0, 5).map((firm, index) => (
                    <div key={firm.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                              {index + 1}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900">{firm.name}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            {firm.street_address}, {firm.city}, {firm.state} {firm.zip_code}
                          </p>
                          <p className="text-xs text-gray-500">{firm.phone}</p>
                          {firm.rating > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              ⭐ {firm.rating} ({firm.reviews_count} reviews)
                            </p>
                          )}
                          {firm.specialties && firm.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {firm.specialties.slice(0, 2).map((specialty, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {specialty}
                                </span>
                              ))}
                              {firm.specialties.length > 2 && (
                                <span className="text-xs text-gray-500">+{firm.specialties.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm font-bold text-blue-600 mb-2">{firm.distance.toFixed(1)} mi</div>
                          <button 
                            onClick={() => handleContactClick(firm.name)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                          >
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">
                      {lawFirms.length === 0 
                        ? 'Loading attorneys...' 
                        : 'No attorneys found'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - moved below map */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="h-5 w-5 text-blue-600 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleBackToHome}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-3"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">New Search</span>
              </button>
              {selectedLocation && (
                <button
                  onClick={handleScheduleClosing}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center space-x-3"
                >
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Schedule Here</span>
                </button>
              )}
            </div>
          </div>

          {/* Location Info */}
          {selectedLocation ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Selected Location</h3>
                  <p className="text-gray-600 text-sm mb-4">{selectedLocation.address}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Latitude: {selectedLocation.lat.toFixed(6)}</p>
                    <p>Longitude: {selectedLocation.lng.toFixed(6)}</p>
                  </div>
                  <button
                    onClick={handleScheduleClosing}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                  >
                    Schedule Closing Here
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Navigation className="h-5 w-5 text-blue-600 mr-2" />
                  How to Use
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p>The map automatically searches for your entered location</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p>Click on the marker to see detailed location information</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p>Use "Schedule Closing Here" to proceed with your appointment</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <p>Click "New Search" to return home and search again</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Coverage Area */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Coverage Areas</h3>
            <div className="space-y-1 text-sm text-blue-700">
              <p>• North Carolina (All Counties)</p>
              <p>• South Carolina (All Counties)</p>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              Professional closing services available throughout both states
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MapPage;