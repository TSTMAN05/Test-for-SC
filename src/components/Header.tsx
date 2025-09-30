import React, { useState } from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, Calendar } from 'lucide-react';
import { isUserSuperAdmin } from '../lib/clerk';
import LawFirmSignupModal from './LawFirmSignupModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isLawFirmModalOpen, setIsLawFirmModalOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const handleLawFirmSignupClick = () => {
    if (!isSignedIn) {
      // Trigger Clerk's sign-in modal directly
      const signInButton = document.querySelector('[data-clerk-sign-in]') as HTMLButtonElement;
      if (signInButton) {
        signInButton.click();
      }
      return;
    }
    setIsLawFirmModalOpen(true);
  };

  return (
    <header className="bg-blue-600 text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity duration-200"
            >
              <Calendar className="w-8 h-8 text-white mr-3" />
              <div className="text-xl font-bold flex items-center space-x-2">
                <span>Schedule</span>
                <span>Closings</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="flex items-center text-white hover:text-blue-200 transition-colors duration-200"
              >
                Company
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {isCompanyDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="/about" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">About Us</a>
                  <a href="/our-team" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Our Team</a>
                </div>
              )}
            </div>
            <a href="/resources" className="text-white hover:text-blue-200 transition-colors duration-200">Resources</a>
            <a href="#" className="text-white hover:text-blue-200 transition-colors duration-200">FAQs</a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isSignedIn ? (
              <>
                <button 
                  onClick={handleLawFirmSignupClick}
                  className="text-white hover:text-blue-200 transition-colors duration-200 text-sm underline"
                >
                  Sign Up Law Firm
                </button>
                <SignUpButton mode="modal">
                  <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors duration-200">
                    Create My Account
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button 
                    data-clerk-sign-in
                    className="border border-white text-white px-4 py-2 rounded-md font-medium hover:bg-white hover:text-blue-600 transition-colors duration-200"
                  >
                    Login
                  </button>
                </SignInButton>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleLawFirmSignupClick}
                  className="text-white hover:text-blue-200 transition-colors duration-200 text-sm underline"
                >
                  Sign Up Law Firm
                </button>
                {isUserSuperAdmin(user) && (
                  <a 
                    href="/admin" 
                    className="text-white hover:text-blue-200 transition-colors duration-200 text-sm underline"
                  >
                    Admin Dashboard
                  </a>
                )}
                <span className="text-white text-sm">
                  Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-200 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
              <button className="block w-full text-left px-3 py-2 text-white hover:text-blue-200">
                Company
              </button>
              <a href="/resources" className="block px-3 py-2 text-white hover:text-blue-200">Resources</a>
              <a href="#" className="block px-3 py-2 text-white hover:text-blue-200">FAQs</a>
              <div className="pt-4 pb-3 border-t border-blue-500">
                {!isSignedIn ? (
                  <>
                    <button 
                      onClick={handleLawFirmSignupClick}
                      className="block w-full text-center text-white hover:text-blue-200 transition-colors duration-200 text-sm underline mb-2"
                    >
                      Sign Up Law Firm
                    </button>
                    <SignUpButton mode="modal">
                      <button className="block w-full mb-2 bg-white text-blue-600 px-3 py-2 rounded-md font-medium">
                        Create My Account
                      </button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <button 
                        data-clerk-sign-in
                        className="block w-full border border-white text-white px-3 py-2 rounded-md font-medium"
                      >
                        Login
                      </button>
                    </SignInButton>
                  </>
                ) : (
                  <div className="px-3 py-2 space-y-3">
                    <button 
                      onClick={handleLawFirmSignupClick}
                      className="block w-full text-center text-white hover:text-blue-200 transition-colors duration-200 text-sm underline"
                    >
                      Sign Up Law Firm
                    </button>
                    {isUserSuperAdmin(user) && (
                      <a 
                        href="/admin" 
                        className="block w-full text-center text-white hover:text-blue-200 transition-colors duration-200 text-sm underline"
                      >
                        Admin Dashboard
                      </a>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-white text-sm">
                        Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                      </span>
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8"
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Law Firm Signup Modal */}
      {isSignedIn && (
        <LawFirmSignupModal 
          isOpen={isLawFirmModalOpen} 
          onClose={() => setIsLawFirmModalOpen(false)} 
        />
      )}
    </header>
  );
};

export default Header;