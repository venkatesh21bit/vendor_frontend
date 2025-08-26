"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, API_URL } from '../../../utils/auth_fn';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

interface RetailerProfileForm {
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstin: string;
  business_type: string;
  established_year: string;
}

const RetailerProfileSetup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RetailerProfileForm>({
    business_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    country: 'India',
    gstin: '',
    business_type: '',
    established_year: ''
  });

  useEffect(() => {
    // Check if user already has a retailer profile
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/retailer/profile/`);
      if (response.ok) {
        // Profile already exists, redirect to dashboard
        router.replace('/retailer');
      }
    } catch (error) {
      // Profile doesn't exist, continue with setup
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter key from submitting form on steps 1 and 2
    if (e.key === 'Enter' && step !== 3) {
      e.preventDefault();
      // Instead, move to next step if current step is valid
      if (validateStep(step)) {
        nextStep();
      } else {
        setError('Please fill in all required fields');
      }
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.business_name && formData.contact_person && formData.phone && formData.email);
      case 2:
        return !!(formData.address_line1 && formData.city && formData.state && formData.pincode);
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError('');
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission on step 3
    if (step !== 3) {
      console.log('Form submission blocked - not on step 3');
      return;
    }
    
    // Call the profile creation function
    await handleCreateProfile();
  };

  const handleCreateProfile = async () => {
    // Double check we're on step 3 and all fields are valid
    if (step !== 3) {
      setError('Please complete all steps');
      return;
    }
    
    if (!validateStep(1) || !validateStep(2)) {
      setError('Please fill in all required fields');
      return;
    }

    console.log('Creating profile - submit button clicked');
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Build payload with proper typing and clean empty fields
      const payload: Record<string, any> = {
        business_name: formData.business_name,
        contact_person: formData.contact_person,
        phone: formData.phone,
        email: formData.email,
        address_line1: formData.address_line1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      // Add optional fields only if they have values
      if (formData.address_line2) payload.address_line2 = formData.address_line2;
      if (formData.country) payload.country = formData.country;
      if (formData.gstin) payload.gstin = formData.gstin;
      if (formData.business_type) payload.business_type = formData.business_type;
      if (formData.established_year) payload.established_year = parseInt(formData.established_year);

      const response = await fetchWithAuth(`${API_URL}/retailers/create-profile/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || 'Profile created successfully!');
        setTimeout(() => {
          router.replace('/retailer');
        }, 2000);
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          setError(errorData.error);
        } else if (errorData.business_name || errorData.email || errorData.phone) {
          // Handle field-specific validation errors
          const fieldErrors = [];
          if (errorData.business_name) fieldErrors.push(`Business Name: ${errorData.business_name[0]}`);
          if (errorData.email) fieldErrors.push(`Email: ${errorData.email[0]}`);
          if (errorData.phone) fieldErrors.push(`Phone: ${errorData.phone[0]}`);
          setError(fieldErrors.join(', '));
        } else {
          setError('Failed to create profile');
        }
      }
    } catch (error) {
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    'Retail Store',
    'Wholesale',
    'Distribution',
    'E-commerce',
    'Supermarket',
    'Department Store',
    'Specialty Store',
    'Convenience Store',
    'Other'
  ];

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Retailer Profile</h1>
          <p className="text-neutral-400">
            Let's set up your business profile to get started with the platform
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Step {step} of 3</span>
            <span className="text-sm text-neutral-400">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-8">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="text-green-400">{success}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {/* Step 1: Business Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Building className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Business Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Primary contact person"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="business@example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Address Information</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Street address, building number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Apartment, suite, floor (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      >
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{6}"
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                        placeholder="600001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                        placeholder="India"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Additional Information</h2>
                  <span className="text-sm text-neutral-400">(Optional)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      GSTIN
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleInputChange}
                      maxLength={15}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Business Type
                    </label>
                    <select
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Established Year
                    </label>
                    <input
                      type="number"
                      name="established_year"
                      value={formData.established_year}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="2020"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                >
                  Previous
                </button>
              )}
              
              <div className="ml-auto">
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateProfile}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Complete Setup
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.replace('/retailer')}
            className="text-neutral-400 hover:text-white transition-colors text-sm"
          >
            Skip for now (you can complete this later)
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetailerProfileSetup;
