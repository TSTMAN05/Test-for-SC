import React from 'react';
import { Calculator, Home, Network } from 'lucide-react';

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Icons Row */}
          <div className="flex items-center justify-center space-x-32 mb-16">
            {/* Calculator Icon */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Calculator className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Discover Text with North Carolina Map */}
            <div className="flex flex-col items-center">
              <div className="text-6xl font-script text-blue-400 mb-4" style={{ fontFamily: 'cursive' }}>
                Discover
              </div>
              {/* North Carolina Map Shape */}
              <div className="relative w-48 h-32">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                  {/* NC State Shape - simplified */}
                  <path
                    d="M20 60 L40 40 L80 35 L120 30 L160 35 L180 45 L185 60 L175 80 L150 85 L120 90 L80 85 L50 80 L30 70 Z"
                    fill="#4ade80"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                  {/* Mountain representation */}
                  <path
                    d="M30 50 L50 35 L70 50 L90 40 L110 55"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="3"
                  />
                  {/* Ocean/coast representation */}
                  <path
                    d="M140 70 Q160 65 180 70 Q170 75 150 75 Q145 72 140 70"
                    fill="#0ea5e9"
                    opacity="0.7"
                  />
                </svg>
              </div>
            </div>

            {/* Network Icon */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 flex items-center justify-center mb-4">
                <Network className="h-16 w-16 text-gray-700" />
              </div>
            </div>
          </div>

          {/* Resources Heading */}
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Resources</h1>

          {/* Description Text */}
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Here are some helpful marketplaces and calculators that can help you navigate the real estate world. When you're 
            ready to schedule your closing, come on back and we'll take care of the rest!
          </p>
        </div>
      </div>

      {/* Resource Cards Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {/* Zillow */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-start space-x-6">
            <div className="flex-shrink-0 w-32 h-24 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 font-bold text-2xl">Zillow</div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">
                <a href="https://www.zillow.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Zillow
                </a>
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Zillow and its affiliates offer customers an on-demand experience for selling, buying, 
                renting and financing with transparency. Zillow Home Loans, their affiliate lender, 
                provides customers with an easy option to get pre-approved and secure financing for 
                their next home purchase.
              </p>
            </div>
          </div>

          {/* Investopedia */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-start space-x-6">
            <div className="flex-shrink-0 w-32 h-24 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-gray-800 font-bold text-lg">Investopedia</div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">
                <a href="https://www.investopedia.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Investopedia
                </a>
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Investopedia's mission is to simplify financial decisions and information to give readers 
                the confidence to manage every aspect of their financial life. No matter your 
                experience level, Investopedia can help improve your financial knowledge and 
                investment skills.
              </p>
            </div>
          </div>

          {/* National Association Realtors */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-start space-x-6">
            <div className="flex-shrink-0 w-32 h-24 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 font-bold text-center">
                <div className="text-sm">NATIONAL</div>
                <div className="text-sm">ASSOCIATION OF</div>
                <div className="text-sm">REALTORS®</div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">
                <a href="https://www.nar.realtor" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  National Association Realtors
                </a>
              </h3>
              <p className="text-gray-700 leading-relaxed">
                The National Association of Realtors is an American trade association for those who 
                work in the real estate industry. Their website provides educational resources, research 
                and statistics, industry news and events, and more!
              </p>
            </div>
          </div>

          {/* Bankrate */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-start space-x-6">
            <div className="flex-shrink-0 w-32 h-24 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 font-bold text-xl">Bankrate</div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-blue-600 mb-3">
                <a href="https://www.bankrate.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Bankrate
                </a>
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Bankrate is a consumer financial services company based in NYC. If you've been 
                thinking about borrowing money and are curious to see what payments would look 
                like before you apply, check out their loan calculator tool to help you plan out your 
                next steps.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Feedback Tab */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-30">
        <button className="bg-blue-600 text-white px-3 py-8 rounded-l-lg font-medium text-sm hover:bg-blue-700 transition-colors duration-200 writing-mode-vertical">
          Feedback
        </button>
      </div>
    </div>
  );
};

export default ResourcesPage;