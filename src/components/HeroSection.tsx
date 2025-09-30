import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Search, Play, Calendar, Rocket, FileText, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const HeroSection = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/map?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.trim().length > 2) {
      // Debounce the search
      searchTimeoutRef.current = setTimeout(() => {
        searchAddresses(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const searchAddresses = async (query: string) => {
    setIsLoadingSuggestions(true);
    try {
      // Use Nominatim API for address suggestions, US only
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=us&addressdetails=1&limit=8&dedupe=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Filter and format US addresses nicely
        const filteredSuggestions = data
          .filter((item: any) => {
            const address = item.address;
            // Only include addresses, cities, counties, and zip codes in the US
            return address && address.country_code === 'us' && (
              address.house_number || // Street addresses
              address.city || address.town || address.village || // Cities
              address.county || // Counties
              address.postcode || // ZIP codes
              item.class === 'place' // Places (cities, towns, etc.)
            );
          })
          .map((item: any) => ({
            display_name: item.display_name,
            formatted: formatAddress(item.address),
            lat: item.lat,
            lon: item.lon,
            address: item.address,
            type: item.type || 'address'
          }));
        
        setSuggestions(filteredSuggestions);
        setShowSuggestions(filteredSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const formatAddress = (address: any) => {
    const parts = [];
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      parts.push(address.road);
    }
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.state) {
      const stateAbbr = address.state === 'North Carolina' ? 'NC' : 
                       address.state === 'South Carolina' ? 'SC' : address.state;
      parts.push(stateAbbr);
    }
    if (address.postcode) {
      parts.push(address.postcode);
    }
    return parts.join(', ');
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSearchQuery(suggestion.formatted);
    setShowSuggestions(false);
    navigate(`/map?q=${encodeURIComponent(suggestion.formatted)}`);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <>
    <section className="relative min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 via-blue-500/60 to-blue-400/70"></div>
        </div>

        {/* Navigation Arrows */}
        <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200">
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Feedback Tab */}
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-30">
          <button className="bg-blue-600 text-white px-3 py-8 rounded-l-lg font-medium text-sm hover:bg-blue-700 transition-colors duration-200 writing-mode-vertical">
            Feedback
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {isSignedIn ? (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Welcome back, {user?.firstName || 'User'}!<br />
                Let's Schedule Your Closing
              </h1>
            ) : (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Let's Schedule Your Closing
              </h1>
            )}
            
            <p className="text-xl sm:text-2xl text-white/90 mb-12 font-light">
              Where would you like to Close?
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="relative z-20">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Enter a US Address, City, County, or ZIP code"
                  className="w-full px-6 py-4 text-lg rounded-lg border-0 shadow-lg focus:ring-4 focus:ring-blue-300 focus:outline-none placeholder-gray-500 relative"
                  autoComplete="off"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md transition-colors duration-200"
                >
                  <Search className="h-5 w-5" />
                </button>
                
                {/* Loading indicator */}
                {isLoadingSuggestions && (
                  <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
                
                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-30">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150 flex items-start space-x-3"
                      >
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {suggestion.formatted}
                          </div>
                          {suggestion.address?.state && (
                            <div className="text-sm text-gray-500 mt-1">
                              {suggestion.address.state}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No results message */}
                {showSuggestions && suggestions.length === 0 && !isLoadingSuggestions && searchQuery.length > 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-3 text-gray-500 text-sm">
                    No addresses found in the US. Try a different search term.
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-6 py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 group">
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Watch Overview</span>
              </button>
              
              <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-6 py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 group">
                <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Schedule Demo</span>
              </button>
              
              <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-6 py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 group">
                <Rocket className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Get Started</span>
              </button>
              
              <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-6 py-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 group">
                <FileText className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Press</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
    </section>
    </>
  );
};

export default HeroSection;