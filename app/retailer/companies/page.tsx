"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RetailerNavbar } from '../../../components/retailer/nav_bar';
import { authStorage } from '../../../utils/localStorage';
import { fetchWithAuth, API_URL } from '../../../utils/auth_fn';
import { Building2, Plus, Users, CheckCircle, Clock, X } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  email: string;
  description?: string;
  status: 'connected' | 'pending' | 'rejected';
  connection_type?: 'invite' | 'code' | 'request';
}

const CompaniesPage = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMethod, setJoinMethod] = useState<'code' | 'request'>('code');
  const [companyCode, setCompanyCode] = useState('');
  const [requestCompanyId, setRequestCompanyId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [profileChecked, setProfileChecked] = useState(false);

  // Check if retailer profile exists
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/retailer/profile/`);
        if (!response.ok) {
          router.replace('/retailer/setup');
          return;
        }
        setProfileChecked(true);
      } catch (error) {
        router.replace('/retailer/setup');
      }
    };

    checkProfile();
  }, [router]);

  useEffect(() => {
    if (!profileChecked) return;
    fetchConnectedCompanies();
    fetchAvailableCompanies();
  }, [profileChecked]);

  const fetchConnectedCompanies = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/retailer/companies/`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch connected companies:', error);
    }
  };

  const fetchAvailableCompanies = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/companies/public/`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCompanies(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch available companies:', error);
    }
  };

  const handleJoinByCode = async () => {
    if (!companyCode.trim()) {
      alert('Please enter an invite code');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/retailer/join-by-code/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: companyCode }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowJoinModal(false);
        setCompanyCode('');
        fetchConnectedCompanies();
        alert(data.message || 'Successfully joined company!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Invalid invite code');
      }
    } catch (error) {
      console.error('Failed to join by code:', error);
      alert('Failed to join company');
    }
    setLoading(false);
  };

  const handleRequestApproval = async () => {
    if (!requestCompanyId || !requestMessage.trim()) {
      alert('Please select a company and provide a message');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/retailer/request-approval/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company_id: parseInt(requestCompanyId),
          message: requestMessage 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowJoinModal(false);
        setRequestCompanyId('');
        setRequestMessage('');
        fetchConnectedCompanies();
        alert(data.message || 'Request sent successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Failed to request approval:', error);
      alert('Failed to send request');
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  if (!profileChecked) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white">Checking profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <RetailerNavbar />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Company Connections</h1>
            <p className="text-neutral-400 mt-2">Manage your connections with manufacturer companies</p>
          </div>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Join Company
          </button>
        </div>

        {/* Connected Companies */}
        <div className="bg-neutral-900 rounded-lg shadow border border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-6 w-6 text-neutral-400" />
            <h2 className="text-xl font-semibold text-white">Your Companies</h2>
          </div>
          
          {companies.length === 0 ? (
            <p className="text-gray-500">No companies connected yet. Join a company to start ordering products.</p>
          ) : (
            <div className="grid gap-4">
              {companies.map((company) => (
                <div key={company.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-gray-600">{company.email}</p>
                      {company.description && (
                        <p className="text-gray-500 mt-1">{company.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(company.status)}
                      <span className={`text-sm font-medium ${
                        company.status === 'connected' ? 'text-green-600' :
                        company.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getStatusText(company.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Join Company Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Join a Company</h3>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="text-neutral-400 hover:text-neutral-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Join Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  How do you want to join?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setJoinMethod('code')}
                    className={`p-2 text-sm rounded-lg border ${
                      joinMethod === 'code'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Company Code
                  </button>
                  <button
                    onClick={() => setJoinMethod('request')}
                    className={`p-2 text-sm rounded-lg border ${
                      joinMethod === 'request'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Request Access
                  </button>
                </div>
              </div>

              {/* Join by Company Code */}
              {joinMethod === 'code' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Code
                    </label>
                    <input
                      type="text"
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleJoinByCode}
                    disabled={loading || !companyCode}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Joining...' : 'Join via Code'}
                  </button>
                </div>
              )}

              {/* Request Approval */}
              {joinMethod === 'request' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Company
                    </label>
                    <select
                      value={requestCompanyId}
                      onChange={(e) => setRequestCompanyId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a company...</option>
                      {availableCompanies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message (Optional)
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Tell them why you want to join..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleRequestApproval}
                    disabled={loading || !requestCompanyId}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
