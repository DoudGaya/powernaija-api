'use client';

import { useEffect, useState } from 'react';
import AnalyticsChart from '@/components/charts/AnalyticsChart';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

  const revenueData = {
    '7d': [
      { label: 'Mon', value: 125000 },
      { label: 'Tue', value: 135000 },
      { label: 'Wed', value: 148000 },
      { label: 'Thu', value: 152000 },
      { label: 'Fri', value: 167000 },
      { label: 'Sat', value: 142000 },
      { label: 'Sun', value: 128000 },
    ],
    '30d': [
      { label: 'Week 1', value: 845000 },
      { label: 'Week 2', value: 912000 },
      { label: 'Week 3', value: 887000 },
      { label: 'Week 4', value: 950000 },
    ],
    '90d': [
      { label: 'Month 1', value: 3250000 },
      { label: 'Month 2', value: 3580000 },
      { label: 'Month 3', value: 3920000 },
    ],
  };

  const usersData = {
    '7d': [
      { label: 'Mon', value: 42 },
      { label: 'Tue', value: 38 },
      { label: 'Wed', value: 55 },
      { label: 'Thu', value: 48 },
      { label: 'Fri', value: 62 },
      { label: 'Sat', value: 35 },
      { label: 'Sun', value: 28 },
    ],
    '30d': [
      { label: 'Week 1', value: 180 },
      { label: 'Week 2', value: 215 },
      { label: 'Week 3', value: 198 },
      { label: 'Week 4', value: 235 },
    ],
    '90d': [
      { label: 'Month 1', value: 620 },
      { label: 'Month 2', value: 780 },
      { label: 'Month 3', value: 850 },
    ],
  };

  const tokensData = {
    '7d': [
      { label: 'Mon', value: 245 },
      { label: 'Tue', value: 268 },
      { label: 'Wed', value: 295 },
      { label: 'Thu', value: 312 },
      { label: 'Fri', value: 338 },
      { label: 'Sat', value: 285 },
      { label: 'Sun', value: 255 },
    ],
    '30d': [
      { label: 'Week 1', value: 1680 },
      { label: 'Week 2', value: 1825 },
      { label: 'Week 3', value: 1750 },
      { label: 'Week 4', value: 1920 },
    ],
    '90d': [
      { label: 'Month 1', value: 6500 },
      { label: 'Month 2', value: 7180 },
      { label: 'Month 3', value: 7850 },
    ],
  };

  const usageData = {
    '7d': [
      { label: 'Mon', value: 1250 },
      { label: 'Tue', value: 1380 },
      { label: 'Wed', value: 1520 },
      { label: 'Thu', value: 1480 },
      { label: 'Fri', value: 1650 },
      { label: 'Sat', value: 1120 },
      { label: 'Sun', value: 980 },
    ],
    '30d': [
      { label: 'Week 1', value: 8400 },
      { label: 'Week 2', value: 9100 },
      { label: 'Week 3', value: 8800 },
      { label: 'Week 4', value: 9500 },
    ],
    '90d': [
      { label: 'Month 1', value: 32500 },
      { label: 'Month 2', value: 35800 },
      { label: 'Month 3', value: 38200 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Platform performance insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          {[
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
            { label: '90 Days', value: '90d' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeRange === option.value
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Revenue Trends (₦)"
          data={revenueData[timeRange as keyof typeof revenueData]}
          type="bar"
          color="#10B981"
          loading={loading}
        />

        <AnalyticsChart
          title="New Users"
          data={usersData[timeRange as keyof typeof usersData]}
          type="line"
          color="#3B82F6"
          loading={loading}
        />

        <AnalyticsChart
          title="Tokens Sold"
          data={tokensData[timeRange as keyof typeof tokensData]}
          type="bar"
          color="#F59E0B"
          loading={loading}
        />

        <AnalyticsChart
          title="Energy Usage (kWh)"
          data={usageData[timeRange as keyof typeof usageData]}
          type="line"
          color="#8B5CF6"
          loading={loading}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg. Transaction</h3>
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">₦15,250</p>
          <p className="text-xs text-green-600 mt-1">+8.2% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">User Retention</h3>
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">87.5%</p>
          <p className="text-xs text-green-600 mt-1">+3.1% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">24.3%</p>
          <p className="text-xs text-green-600 mt-1">+2.8% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Carbon Impact</h3>
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">3,421 kg</p>
          <p className="text-xs text-green-600 mt-1">CO₂ reduced this period</p>
        </div>
      </div>
    </div>
  );
}
