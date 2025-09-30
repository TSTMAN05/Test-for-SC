import React, { useState } from 'react';
import { X, Building, MapPin, Phone, Mail, Globe, Clock, Star, FileText, CheckCircle } from 'lucide-react';
import { lawFirmApplicationService } from '../lib/firebase';

interface LawFirmSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Basic Information
  firmName: string;
  contactPersonName: string;
  contactPersonTitle: string;
  
  // Contact Information
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  
  // Business Information
  yearsInBusiness: string;
  numberOfAttorneys: string;
  specialties: string[];
  
  // Services
  servicesOffered: string[];
  averageClosingTime: string;
  
  // Hours and Availability
  businessHours: string;
  weekendAvailability: boolean;
  emergencyServices: boolean;
  
  // Additional Information
  additionalInfo: string;
  
  // Agreements
  termsAccepted: boolean;
  marketingConsent: boolean;
}

const LawFirmSignupModal: React.FC<LawFirmSignupModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firmName: '',
    contactPersonName: '',
    contactPersonTitle: '',
    streetAddress: '',
    city: '',
    state: 'NC',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    yearsInBusiness: '',
    numberOfAttorneys: '',
    specialties: [],
    servicesOffered: [],
    averageClosingTime: '',
    businessHours: 'Mon-Fri 9AM-5PM',
    weekendAvailability: false,
    emergencyServices: false,
    additionalInfo: '',
    termsAccepted: false,
    marketingConsent: false
  });

  const totalSteps = 4;

  const specialtyOptions = [
    'Real Estate Law',
    'Corporate Law',
    'Family Law',
    'Estate Planning',
    'Business Law',
    'Contract Law',
    'Property Law',
    'Commercial Real Estate',
    'Residential Real Estate',
    'Title Services'
  ];

  const serviceOptions = [
    'Residential Closings',
    'Commercial Closings',
    'Refinancing',
    'Title Insurance',
    'Document Preparation',
    'Escrow Services',
    'Property Searches',
    '1031 Exchanges',
    'Construction Loans',
    'Mobile Notary Services'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelectChange = (field: 'specialties' | 'servicesOffered', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit the application to Supabase
      const applicationData = {
        firm_name: formData.firmName,
        contact_person_name: formData.contactPersonName,
        contact_person_title: formData.contactPersonTitle,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        phone: formData.phone,
        email: formData.email,
        website: formData.website || '',
        years_in_business: formData.yearsInBusiness,
        number_of_attorneys: formData.numberOfAttorneys,
        specialties: formData.specialties,
        services_offered: formData.servicesOffered,
        average_closing_time: formData.averageClosingTime,
        business_hours: formData.businessHours,
        weekend_availability: formData.weekendAvailability,
        emergency_services: formData.emergencyServices,
        additional_info: formData.additionalInfo || '',
        terms_accepted: formData.termsAccepted,
        marketing_consent: formData.marketingConsent
      };

      console.log('Submitting application:', applicationData);
      const result = await lawFirmApplicationService.submitApplication(applicationData);
      console.log('Application submitted successfully:', result);

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(`Error submitting application: ${error.message || error}`);
      setIsSubmitting(false);
      // Don't show success if there's an error
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setIsSubmitted(false);
    setFormData({
      firmName: '',
      contactPersonName: '',
      contactPersonTitle: '',
      streetAddress: '',
      city: '',
      state: 'NC',
      zipCode: '',
      phone: '',
      email: '',
      website: '',
      yearsInBusiness: '',
      numberOfAttorneys: '',
      specialties: [],
      servicesOffered: [],
      averageClosingTime: '',
      businessHours: 'Mon-Fri 9AM-5PM',
      weekendAvailability: false,
      emergencyServices: false,
      additionalInfo: '',
      termsAccepted: false,
      marketingConsent: false
    });
    onClose();
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Congratulations!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in joining our network. We'll review your application and get back to you within 24 hours.
          </p>
          <button
            onClick={handleClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Join Our Network</h2>
            <p className="text-gray-600">Law Firm Registration - Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <React.Fragment key={i}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`flex-1 h-2 rounded ${
                      i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Building className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Law Firm Name *
                  </label>
                  <input
                    type="text"
                    name="firmName"
                    value={formData.firmName}
                    onChange={handleInputChange}
                    required
                   autoComplete="organization"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your law firm's name"
                   style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleInputChange}
                    required
                   autoComplete="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full name"
                   style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title/Position *
                  </label>
                  <input
                    type="text"
                    name="contactPersonTitle"
                    value={formData.contactPersonTitle}
                    onChange={handleInputChange}
                    required
                   autoComplete="organization-title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Managing Partner, Attorney"
                   style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business *
                  </label>
                  <select
                    name="yearsInBusiness"
                    value={formData.yearsInBusiness}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                   style={{ color: '#000000' }}
                  >
                    <option value="">Select years</option>
                    <option value="0-1">0-1 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="11-20">11-20 years</option>
                    <option value="20+">20+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Attorneys *
                  </label>
                  <select
                    name="numberOfAttorneys"
                    value={formData.numberOfAttorneys}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                   style={{ color: '#000000' }}
                  >
                    <option value="">Select number</option>
                    <option value="1">1 attorney</option>
                    <option value="2-5">2-5 attorneys</option>
                    <option value="6-10">6-10 attorneys</option>
                    <option value="11-25">11-25 attorneys</option>
                    <option value="25+">25+ attorneys</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    required
                   autoComplete="street-address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main Street"
                   style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                   autoComplete="address-level2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Charlotte"
                   style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                   style={{ color: '#000000' }}
                  >
                    <option value="NC">North Carolina</option>
                    <option value="SC">South Carolina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                   autoComplete="postal-code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="28202"
                   style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                   autoComplete="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(704) 555-0123"
                   style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                   autoComplete="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contact@lawfirm.com"
                   style={{ color: '#000000' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                   autoComplete="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.lawfirm.com"
                   style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services & Specialties */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Star className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Services & Specialties</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Legal Specialties * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => handleMultiSelectChange('specialties', specialty)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Services Offered * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceOptions.map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.servicesOffered.includes(service)}
                        onChange={() => handleMultiSelectChange('servicesOffered', service)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Closing Time *
                  </label>
                  <select
                    name="averageClosingTime"
                    value={formData.averageClosingTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                   style={{ color: '#000000' }}
                  >
                    <option value="">Select timeframe</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="2-3 weeks">2-3 weeks</option>
                    <option value="3-4 weeks">3-4 weeks</option>
                    <option value="4+ weeks">4+ weeks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours *
                  </label>
                  <input
                    type="text"
                    name="businessHours"
                    value={formData.businessHours}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mon-Fri 9AM-5PM"
                   style={{ color: '#000000' }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="weekendAvailability"
                    checked={formData.weekendAvailability}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Weekend availability for urgent closings</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="emergencyServices"
                    checked={formData.emergencyServices}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Emergency closing services available</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Additional Information & Terms */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us anything else about your firm that would be helpful for potential clients to know..."
                 style={{ color: '#000000' }}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h4 className="font-semibold text-gray-900">Terms and Agreements</h4>
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    required
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-700 underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a>. I understand that my firm's information will be displayed on the Schedule Closings platform for potential clients to view and contact. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to receive marketing communications and updates about the Schedule Closings platform. You can unsubscribe at any time.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              Previous
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={!formData.termsAccepted || isSubmitting}
                className={`px-8 py-2 rounded-md font-medium transition-colors duration-200 ${
                  !formData.termsAccepted || isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LawFirmSignupModal;