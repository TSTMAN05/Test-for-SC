import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Mail, Phone, MapPin, Instagram, Linkedin, Youtube, Facebook } from 'lucide-react';
import LawFirmSignupModal from './LawFirmSignupModal';

const Footer = () => {
  const [isLawFirmModalOpen, setIsLawFirmModalOpen] = React.useState(false);
  const { isSignedIn } = useUser();

  const handleLawFirmSignupClick = () => {
    if (!isSignedIn) {
      // Trigger Clerk's sign-in modal
      const signInButton = document.querySelector('[data-clerk-sign-in]') as HTMLButtonElement;
      if (signInButton) {
        signInButton.click();
      }
      return;
    }
    setIsLawFirmModalOpen(true);
  };

  return (
    <>
      <footer className="bg-blue-600 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and Social Media */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-white rounded mr-3 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-xs"></div>
              </div>
            </div>
            <div className="text-2xl font-bold">
              <span className="block leading-tight">Schedule</span>
              <span className="block leading-tight">Closings</span>
            </div>
          </div>
          
          {/* Social Media Icons */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <a href="#" className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200">
              <Instagram className="h-5 w-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors duration-200">
              <Linkedin className="h-5 w-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200">
              <Youtube className="h-5 w-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors duration-200">
              <Facebook className="h-5 w-5 text-white" />
            </a>
            <a href="#" className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors duration-200">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </a>
          </div>
          
          {/* Divider Line */}
          <div className="w-full h-px bg-white/20 mb-12"></div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Contact Section */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-center md:text-left">CONTACT</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <Mail className="h-5 w-5 text-white/80" />
                <a href="mailto:info@scheduleclosings.com" className="text-white/90 hover:text-white transition-colors duration-200">
                  info@scheduleclosings.com
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <Phone className="h-5 w-5 text-white/80" />
                <a href="tel:(704)965-1777" className="text-white/90 hover:text-white transition-colors duration-200">
                  (704) 965-1777
                </a>
              </div>
              <div className="flex items-start justify-center md:justify-start space-x-3">
                <MapPin className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                <div className="text-white/90">
                  <div>10610 Metromont Pkwy Charlotte, NC</div>
                  <div>28269</div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-center md:text-left">COMPANY</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-8">
              <a href="/about" className="text-white/90 hover:text-white transition-colors duration-200">About Us</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors duration-200">Security</a>
              <a href="/our-team" className="text-white/90 hover:text-white transition-colors duration-200">Meet The Team</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors duration-200">Newsletter</a>
            </div>
          </div>

          {/* Navigate Section */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-center md:text-left">NAVIGATE</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-8">
              <a href="/resources" className="text-white/90 hover:text-white transition-colors duration-200">Resources</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors duration-200">Investor Relations</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors duration-200">FAQ</a>
              <button 
                onClick={handleLawFirmSignupClick}
                className="text-white/90 hover:text-white transition-colors duration-200 text-left"
              >
                Sign Up Law Firm
              </button>
              <a href="#" className="text-white/90 hover:text-white transition-colors duration-200">Login</a>
            </div>
          </div>
        </div>
      </div>
      </footer>
      
      {/* Law Firm Signup Modal */}
      {isSignedIn && (
        <LawFirmSignupModal 
          isOpen={isLawFirmModalOpen} 
          onClose={() => setIsLawFirmModalOpen(false)} 
        />
      )}
    </>
  );
};

export default Footer;