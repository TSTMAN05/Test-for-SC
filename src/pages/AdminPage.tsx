import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Shield, Plus, Edit, Trash2, MapPin, Phone, Mail, Globe, Star, Users, AlertCircle, Save, X, FileText, Check, XCircle, Clock, Eye } from 'lucide-react';
import { isUserSuperAdmin } from '../lib/clerk';
import { lawFirmService, LawFirm, lawFirmApplicationService, LawFirmApplication } from '../lib/firebase';
import Footer from '../components/Footer';

const AdminPage = () => {
  const { user, isSignedIn } = useUser();
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([]);
  const [applications, setApplications] = useState<LawFirmApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [editingFirm, setEditingFirm] = useState<LawFirm | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'firms' | 'applications'>('firms');
  const [selectedApplication, setSelectedApplication] = useState<LawFirmApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [formData, setFormData] = useState<Partial<LawFirm>>({
    name: '',
    street_address: '',
    city: '',
    state: 'NC',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    latitude: 0,
    longitude: 0,
    rating: 0,
    reviews_count: 0,
    specialties: [],
    hours: 'Mon-Fri 9AM-5PM',
    is_active: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user has admin access
  const hasAdminAccess = isSignedIn && isUserSuperAdmin(user);

  useEffect(() => {
    if (hasAdminAccess) {
      loadLawFirms();
      loadApplications();
    }
  }, [hasAdminAccess]);

  // Add effect to reload data when tab changes
  useEffect(() => {
    if (hasAdminAccess && activeTab === 'applications') {
      loadApplications();
    } else if (hasAdminAccess && activeTab === 'firms') {
      loadLawFirms();
    }
  }, [hasAdminAccess, activeTab]);

  const loadLawFirms = async () => {
    try {
      setLoading(true);
      const firms = await lawFirmService.getAllLawFirms();
      setLawFirms(firms);
    } catch (error) {
      console.error('Error loading law firms:', error);
      setError('Failed to load law firms');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);
      const apps = await lawFirmApplicationService.getAllApplications();
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'specialties') {
      // Handle specialties as comma-separated string
      const specialtiesArray = value.split(',').map(s => s.trim()).filter(s => s);
      setFormData(prev => ({ ...prev, [name]: specialtiesArray }));
    } else if (name === 'latitude' || name === 'longitude' || name === 'rating') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'reviews_count') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingFirm) {
        // Update existing firm
        await lawFirmService.updateLawFirm(editingFirm.id, formData);
        setSuccess('Law firm updated successfully');
        setEditingFirm(null);
      } else {
        // Create new firm
        await lawFirmService.createLawFirm(formData as Omit<LawFirm, 'id' | 'created_at' | 'updated_at'>);
        setSuccess('Law firm created successfully');
        setShowAddForm(false);
      }
      
      // Reset form and reload data
      setFormData({
        name: '',
        street_address: '',
        city: '',
        state: 'NC',
        zip_code: '',
        phone: '',
        email: '',
        website: '',
        latitude: 0,
        longitude: 0,
        rating: 0,
        reviews_count: 0,
        specialties: [],
        hours: 'Mon-Fri 9AM-5PM',
        is_active: true
      });
      
      await loadLawFirms();
    } catch (error) {
      console.error('Error saving law firm:', error);
      setError('Failed to save law firm');
    }
  };

  const handleEdit = (firm: LawFirm) => {
    setEditingFirm(firm);
    setFormData({
      ...firm,
      specialties: firm.specialties || []
    });
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this law firm?')) {
      return;
    }

    try {
      await lawFirmService.deleteLawFirm(id);
      setSuccess('Law firm deleted successfully');
      await loadLawFirms();
    } catch (error) {
      console.error('Error deleting law firm:', error);
      setError('Failed to delete law firm');
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'deny') => {
    try {
      const reviewedBy = user?.emailAddresses[0]?.emailAddress || user?.id || 'Admin';
      
      if (action === 'approve') {
        await lawFirmApplicationService.approveApplicationAndCreateFirm(applicationId, reviewNotes, reviewedBy);
        setSuccess('Application approved and law firm created successfully');
        await loadLawFirms(); // Reload law firms to show the new one
      } else {
        await lawFirmApplicationService.updateApplicationStatus(applicationId, 'denied', reviewNotes, reviewedBy);
        setSuccess('Application denied successfully');
      }
      
      await loadApplications(); // Reload applications
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error processing application:', error);
      setError('Failed to process application');
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      await lawFirmApplicationService.deleteApplication(applicationId);
      setSuccess('Application deleted successfully');
      await loadApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      setError('Failed to delete application');
    }
  };

  const cancelEdit = () => {
    setEditingFirm(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      street_address: '',
      city: '',
      state: 'NC',
      zip_code: '',
      phone: '',
      email: '',
      website: '',
      latitude: 0,
      longitude: 0,
      rating: 0,
      reviews_count: 0,
      specialties: [],
      hours: 'Mon-Fri 9AM-5PM',
      is_active: true
    });
  };

  // Geocoding function to get coordinates from address
  const geocodeAddress = async () => {
    const address = `${formData.street_address}, ${formData.city}, ${formData.state} ${formData.zip_code}`;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setSuccess('Coordinates found and updated');
      } else {
        setError('Could not find coordinates for this address');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      setError('Failed to geocode address');
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600">You must be signed in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need super admin privileges to access this page.</p>
          <a
            href="/admin-setup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Set Up Admin Access
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage law firms and locations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('firms')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    activeTab === 'firms'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Law Firms ({lawFirms.length})
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 relative ${
                    activeTab === 'applications'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Applications ({applications.filter(app => app.status === 'pending').length})
                  {applications.filter(app => app.status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {applications.filter(app => app.status === 'pending').length}
                    </span>
                  )}
                </button>
              </div>
              
              {activeTab === 'firms' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Law Firm</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingFirm) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingFirm ? 'Edit Law Firm' : 'Add New Law Firm'}
              </h2>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  name="street_address"
                  value={formData.street_address || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <select
                  name="state"
                  value={formData.state || 'NC'}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="NC">North Carolina</option>
                  <option value="SC">South Carolina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude *</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude || ''}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Get Coords
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  name="rating"
                  value={formData.rating || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reviews Count</label>
                <input
                  type="number"
                  min="0"
                  name="reviews_count"
                  value={formData.reviews_count || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties (comma-separated)</label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties?.join(', ') || ''}
                  onChange={handleInputChange}
                  placeholder="Real Estate, Corporate Law, Family Law"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                <input
                  type="text"
                  name="hours"
                  value={formData.hours || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active || false}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingFirm ? 'Update' : 'Create'} Law Firm</span>
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'firms' ? (
          /* Law Firms List */
          <div className="bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Law Firms ({lawFirms.length})</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading law firms...</p>
              </div>
            ) : lawFirms.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No law firms found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {lawFirms.map((firm) => (
                  <div key={firm.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{firm.name}</h3>
                          {!firm.is_active && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{firm.street_address}, {firm.city}, {firm.state} {firm.zip_code}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{firm.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{firm.email}</span>
                          </div>
                          {firm.website && (
                            <div className="flex items-center space-x-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a href={firm.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {firm.specialties && firm.specialties.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {firm.specialties.map((specialty, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {firm.rating > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-gray-600">{firm.rating} ({firm.reviews_count} reviews)</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(firm)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(firm.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Applications List */
          <div className="space-y-6">
            {/* Application Status Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Approved</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {applications.filter(app => app.status === 'approved').length}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Denied</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {applications.filter(app => app.status === 'denied').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Law Firm Applications ({applications.length})</h2>
              </div>

              {applicationsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{application.firm_name}</h3>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{application.street_address}, {application.city}, {application.state} {application.zip_code}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{application.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{application.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{application.contact_person_name} ({application.contact_person_title})</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            <p>Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                            {application.reviewed_at && (
                              <p>Reviewed: {new Date(application.reviewed_at).toLocaleDateString()} by {application.reviewed_by}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApplicationAction(application.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors duration-200"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleApplicationAction(application.id, 'deny')}
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors duration-200"
                                title="Deny"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteApplication(application.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-md transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.firm_name}</h2>
                  <p className="text-gray-600">Application Details</p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Contact Person:</span>
                      <p className="text-gray-600">{selectedApplication.contact_person_name} ({selectedApplication.contact_person_title})</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Years in Business:</span>
                      <p className="text-gray-600">{selectedApplication.years_in_business}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Number of Attorneys:</span>
                      <p className="text-gray-600">{selectedApplication.number_of_attorneys}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Average Closing Time:</span>
                      <p className="text-gray-600">{selectedApplication.average_closing_time}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Address:</span>
                      <p className="text-gray-600">{selectedApplication.street_address}, {selectedApplication.city}, {selectedApplication.state} {selectedApplication.zip_code}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-600">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-600">{selectedApplication.email}</p>
                    </div>
                    {selectedApplication.website && (
                      <div>
                        <span className="font-medium text-gray-700">Website:</span>
                        <p className="text-gray-600">
                          <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            {selectedApplication.website}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services & Specialties */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Specialties</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">Legal Specialties:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedApplication.specialties.map((specialty, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Services Offered:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedApplication.services_offered.map((service, index) => (
                          <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Business Hours:</span>
                        <p className="text-gray-600">{selectedApplication.business_hours}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Weekend Availability:</span>
                        <p className="text-gray-600">{selectedApplication.weekend_availability ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Emergency Services:</span>
                        <p className="text-gray-600">{selectedApplication.emergency_services ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {selectedApplication.additional_info && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                    <p className="text-gray-600 text-sm">{selectedApplication.additional_info}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedApplication.status === 'pending' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Review</h3>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about this application..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Existing Admin Notes */}
                {selectedApplication.admin_notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Admin Notes</h3>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">{selectedApplication.admin_notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleApplicationAction(selectedApplication.id, 'deny')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <XCircle className="h-5 w-5" />
                      <span>Deny Application</span>
                    </button>
                    <button
                      onClick={() => handleApplicationAction(selectedApplication.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Check className="h-5 w-5" />
                      <span>Approve & Create Law Firm</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;