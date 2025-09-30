import React from 'react';
import Footer from '../components/Footer';

const OurTeamPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left Content - Text */}
            <div className="lg:col-span-2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Meet Our Team!
              </h1>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 italic">
                    Larry Thompson, Founder and CEO
                  </h2>
                </div>
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Larry Thompson started Venture Realty, LLC in 2002 and a transformation of his original 
                    company, L P Thompson Realty that he started in 1999.
                  </p>
                  
                  <p>
                    Larry saw the need for a one stop source for Mortgages, Real Estate and closing services 
                    combined and after being ranked #13 in the country as a Rookie Loan originator in 2003, he 
                    decided that the two should join. Since its beginnings, Venture Realty has been able to 
                    consistently produce high quality search capabilities both on the Retail side and on the 
                    Investment side. During its beginning, Venture drew from the Investment experience of Larry and 
                    the technological advances that the internet began to provide. Through many years of testing, 
                    marketing and research, Venture began to take the true shape of a One Stop Shop.
                  </p>
                  
                  <p>
                    In 2015, he opened a Branch of American Financial Network INC and has been a top producing 
                    Branch Manager ever since.
                  </p>
                  
                  <p>
                    He is constantly trying out new marketing and searching for those perfect properties and better 
                    processes to make the experience that much easier for the clients. In 2018, Larry wanted to start 
                    a Title Insurance business to compliment the Real Estate and Mortgage businesses. After years of 
                    research, he found the right partner and along with his wife Kim, started Affiliated Title Ventures, 
                    LLC. Then they needed a marketing arm to showcase their products to the world. So that was the start of Schedule Ventures, LLC, the holding company 
                    of Schedule Closings, LLC. Schedule Closings is a Marketing / Scheduling platform that allows Realtors, Lenders and Customers to see and book closings 
                    on Attorneys live closings calendars. It also distributes documents and connects all parties. Schedule Closings just launched in mid 2023 as a live site and 
                    is now building momentum to eventually go nationwide and public someday.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Profile Image */}
            <div className="lg:col-span-1 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-80 bg-blue-600 rounded-full overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
                    alt="Larry Thompson, Founder and CEO"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
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

      <Footer />
    </div>
  );
};

export default OurTeamPage;