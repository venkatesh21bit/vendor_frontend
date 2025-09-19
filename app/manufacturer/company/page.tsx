"use client";
import React, { useState, useEffect, Suspense } from "react";
import { API_URL, fetchWithAuth } from "@/utils/auth_fn";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Company = {
  id?: number;
  name: string;
  gstin: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
};

const initialCompanyState: Company = {
  id: undefined,
  name: "",
  gstin: "",
  address: "",
  state: "",
  city: "",
  pincode: "",
  phone: "",
  email: "",
};


function CompanyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstTime = searchParams.get("first") === "true";
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formCompany, setFormCompany] = useState<Company>(initialCompanyState);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
   // On mount, if first time, force create mode
  useEffect(() => {
    if (isFirstTime) {
      setIsCreating(true);
      setIsEditing(true);
      setSelectedCompany(null);
      setFormCompany(initialCompanyState);
    }
  }, [isFirstTime]);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchWithAuth(`${API_URL}/company/`);
        if (res.ok) {
          const data = await res.json();
          // Convert _id to id for frontend compatibility
          const companiesWithId = data.map((company: any) => ({
            ...company,
            id: company._id || company.id
          }));
          setCompanies(companiesWithId);
          if (companiesWithId.length > 0) {
            const company = companiesWithId[0];
            setSelectedCompany(company);
            // Ensure all fields are strings to prevent controlled/uncontrolled issues
            setFormCompany({
              ...company,
              name: company.name || "",
              gstin: company.gstin || "",
              address: company.address || "",
              state: company.state || "",
              city: company.city || "",
              pincode: company.pincode || "",
              phone: company.phone || "",
              email: company.email || "",
            });
          } else {
            setCompanies([]);
            setSelectedCompany(null);
            setFormCompany(initialCompanyState);
            setIsCreating(true);
            setIsEditing(true);
          }
        }
      } catch (err) {
        setError("Failed to fetch companies.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormCompany({ ...formCompany, [e.target.name]: e.target.value });
  };

  // Select a company from the list
  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    // Ensure all fields are strings to prevent controlled/uncontrolled issues
    setFormCompany({
      ...company,
      name: company.name || "",
      gstin: company.gstin || "",
      address: company.address || "",
      state: company.state || "",
      city: company.city || "",
      pincode: company.pincode || "",
      phone: company.phone || "",
      email: company.email || "",
    });
    setIsEditing(false);
    setIsCreating(false);
    setMessage("");
    setError("");
  };

  // Start creating a new company
  const handleStartCreate = () => {
    setFormCompany(initialCompanyState);
    setSelectedCompany(null);
    setIsEditing(true);
    setIsCreating(true);
    setMessage("");
    setError("");
  };

  // Create company
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetchWithAuth(`${API_URL}/company/`, {
        method: "POST",
        body: JSON.stringify(formCompany),
      });
      if (res.ok) {
        const data = await res.json();
        const newCompany = data.company || data; // Handle both response formats
        // Convert _id to id for frontend compatibility
        const companyWithId = {
          ...newCompany,
          id: newCompany._id || newCompany.id
        };
        setCompanies((prev) => [...prev, companyWithId]);
        setSelectedCompany(companyWithId);
        // Ensure all fields are strings
        setFormCompany({
          ...companyWithId,
          name: companyWithId.name || "",
          gstin: companyWithId.gstin || "",
          address: companyWithId.address || "",
          state: companyWithId.state || "",
          city: companyWithId.city || "",
          pincode: companyWithId.pincode || "",
          phone: companyWithId.phone || "",
          email: companyWithId.email || "",
        });
        setMessage("Company created successfully!");
        setIsEditing(false);
        setIsCreating(false);
        // Store company id for session
        localStorage.setItem("company_id", companyWithId.id);
        // If first time, redirect to dashboard after short delay
        if (isFirstTime) {
          setTimeout(() => {
            router.replace("/manufacturer");
          }, 1200);
        }
      } else {
        const data = await res.json();
        setError(data.error || data.detail || "Failed to create company.");
      }
    } catch {
      setError("Failed to create company.");
    }
  };

  // Edit company
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!formCompany.id) return;
    
    console.log('Updating company with data:', formCompany);
    console.log('Company ID:', formCompany.id);
    
    try {
      const res = await fetchWithAuth(`${API_URL}/company/${formCompany.id}/`, {
        method: "PUT",
        body: JSON.stringify(formCompany),
      });
      
      console.log('Update response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Update response data:', data);
        
        const updatedCompany = data.company || data; // Handle both response formats
        // Convert _id to id for frontend compatibility
        const companyWithId = {
          ...updatedCompany,
          id: updatedCompany._id || updatedCompany.id
        };
        setCompanies((prev) =>
          prev.map((c) => (c.id === companyWithId.id ? companyWithId : c))
        );
        setSelectedCompany(companyWithId);
        // Ensure all fields are strings
        setFormCompany({
          ...companyWithId,
          name: companyWithId.name || "",
          gstin: companyWithId.gstin || "",
          address: companyWithId.address || "",
          state: companyWithId.state || "",
          city: companyWithId.city || "",
          pincode: companyWithId.pincode || "",
          phone: companyWithId.phone || "",
          email: companyWithId.email || "",
        });
        setMessage("Company details updated!");
        setIsEditing(false);
        setIsCreating(false);
      } else {
        const data = await res.json();
        console.log('Update error response:', data);
        setError(data.error || data.detail || "Failed to update company.");
      }
    } catch (error) {
      console.log('Update catch error:', error);
      setError("Failed to update company.");
    }
  };

  // Cancel editing/creating
  const handleCancel = () => {
    if (selectedCompany) {
      // Ensure all fields are strings
      setFormCompany({
        ...selectedCompany,
        name: selectedCompany.name || "",
        gstin: selectedCompany.gstin || "",
        address: selectedCompany.address || "",
        state: selectedCompany.state || "",
        city: selectedCompany.city || "",
        pincode: selectedCompany.pincode || "",
        phone: selectedCompany.phone || "",
        email: selectedCompany.email || "",
      });
      setIsEditing(false);
      setIsCreating(false);
    } else {
      setFormCompany(initialCompanyState);
      setIsEditing(false);
      setIsCreating(false);
    }
    setMessage("");
    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-start justify-center p-8">
      <div className="flex-1 max-w-xl">
        {isFirstTime && (
  <div className="mb-6 text-center text-blue-400 text-lg font-semibold">
    Welcome! Please create your company to get started.
  </div>
)}
        <Card className="bg-gray-900 text-white border border-gray-700 w-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isCreating
                ? "Create Company"
                : selectedCompany
                ? isEditing
                  ? "Edit Company"
                  : "Company Details"
                : "Select a Company"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(isCreating || selectedCompany) && (
              <form
                onSubmit={isCreating ? handleCreate : handleEdit}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formCompany.name}
                    onChange={handleChange}
                    required
                    disabled={!isEditing && !isCreating}
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    name="gstin"
                    value={formCompany.gstin}
                    onChange={handleChange}
                    required
                    disabled={!isEditing && !isCreating}
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formCompany.address}
                    onChange={handleChange}
                    required
                    disabled={!isEditing && !isCreating}
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formCompany.state}
                      onChange={handleChange}
                      required
                      disabled={!isEditing && !isCreating}
                      className="bg-gray-800 text-white border-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formCompany.city}
                      onChange={handleChange}
                      required
                      disabled={!isEditing && !isCreating}
                      className="bg-gray-800 text-white border-gray-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formCompany.pincode}
                      onChange={handleChange}
                      required
                      disabled={!isEditing && !isCreating}
                      className="bg-gray-800 text-white border-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formCompany.phone}
                      onChange={handleChange}
                      disabled={!isEditing && !isCreating}
                      className="bg-gray-800 text-white border-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formCompany.email}
                    onChange={handleChange}
                    disabled={!isEditing && !isCreating}
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {message && <p className="text-green-500 text-sm">{message}</p>}
                <div className="flex gap-4 mt-4">
                  {(isCreating || isEditing) && (
                    <>
                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        {isCreating ? "Create Company" : "Save Changes"}
                      </Button>
                      <Button type="button" className="w-full bg-gray-700 hover:bg-gray-800" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </>
                  )}
                  {!isCreating && selectedCompany && !isEditing && (
                    <Button type="button" className="w-full bg-yellow-600 hover:bg-yellow-700" onClick={() => { setIsEditing(true); setIsCreating(false); }}>
                      Edit
                    </Button>
                  )}
                </div>
              </form>
            )}
            {!isCreating && !selectedCompany && (
              <div className="text-gray-400 text-center py-8">
                No company found. Please create your company.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}>
      <CompanyPageContent />
    </Suspense>
  );
}