'use client';

import { useEffect, useState } from 'react';

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  region?: string;
  isActive: boolean;
  totalTokensSold: number;
  totalRevenue: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/companies', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();
      setCompanies(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Energy Companies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Nigerian energy distribution companies</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
          + Add Company
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </>
        ) : companies.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No companies found
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {company.name.charAt(0)}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    company.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {company.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Company Info */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{company.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {company.description || 'No description available'}
              </p>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Region:</span>
                  <span className="font-medium text-gray-900">{company.region || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tokens Sold:</span>
                  <span className="font-medium text-gray-900">{company.totalTokensSold?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-medium text-green-600">₦{(company.totalRevenue || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button className="flex-1 px-3 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors">
                  View Details
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
