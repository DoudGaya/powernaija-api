'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';

interface CarbonCredit {
  id: string;
  amount: number;
  co2Reduced: number;
  status: string;
  createdAt: string;
}

export default function CarbonCreditsPage() {
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [stats, setStats] = useState({ total: 0, monetized: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCarbonCredits();
  }, []);

  const fetchCarbonCredits = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/carbon-credits', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch carbon credits');
      }

      const data = await response.json();
      setCredits(data.data?.credits || []);
      setStats(data.data?.stats || { total: 0, monetized: 0, available: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch carbon credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carbon Credits</h1>
          <p className="text-sm text-gray-500 mt-1">Track and monetize carbon reduction</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total CO₂ Reduced"
          value={loading ? '...' : `${stats.total.toFixed(2)} kg`}
          loading={loading}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Monetized Credits"
          value={loading ? '...' : `${stats.monetized.toFixed(2)} kg`}
          loading={loading}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Available Credits"
          value={loading ? '...' : `${stats.available.toFixed(2)} kg`}
          loading={loading}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          }
        />
      </div>

      {/* Carbon Credits Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Carbon Credits Work</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Track Energy Usage</h4>
                <p className="text-sm text-gray-600">
                  Your energy consumption is automatically monitored and logged
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Calculate CO₂ Reduction</h4>
                <p className="text-sm text-gray-600">
                  Every kWh saved translates to reduced carbon emissions
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Monetize Credits</h4>
                <p className="text-sm text-gray-600">
                  Convert your carbon credits to cash or energy tokens
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monetization Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monetization Options</h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Sell to Cash</h4>
                <span className="text-green-600 font-bold">₦50/kg</span>
              </div>
              <p className="text-sm text-gray-600">
                Convert your carbon credits directly to cash in your wallet
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Convert to Tokens</h4>
                <span className="text-green-600 font-bold">1kg = 10kWh</span>
              </div>
              <p className="text-sm text-gray-600">
                Exchange carbon credits for energy tokens at preferential rates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credits History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Carbon Credits History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CO₂ Reduced
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : credits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No carbon credits yet
                  </td>
                </tr>
              ) : (
                credits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(credit.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {credit.co2Reduced.toFixed(2)} kg
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ₦{credit.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          credit.status === 'AVAILABLE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {credit.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
