import React, { useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

interface SearchFormProps {
  onSearch: (address: string, closingDate: string) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [address, setAddress] = useState('');
  const [closingDate, setClosingDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(address, closingDate);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Property Address Field */}
          <div className="space-y-2 md:col-span-3">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <span>Subject Property Address</span>
              <span className="text-red-500">*</span>
              <div className="group relative">
                <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 cursor-help">
                  i
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Enter the complete property address
                </div>
              </div>
            </label>
            <div className="relative">
              <AddressAutocomplete
                value={address}
                onChange={setAddress}
                placeholder="What is the subject property address, city or state?"
                required
              />
            </div>
          </div>

          {/* Closing Date Field */}
          <div className="space-y-2 md:col-span-1">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <span>Estimate Closing Date</span>
              <div className="group relative">
                <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 cursor-help">
                  i
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Select your estimated closing date
                </div>
              </div>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90"
                required
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Search className="h-5 w-5" />
            <span>Find Available Firms</span>
          </button>
        </div>
      </form>
    </div>
  );
}