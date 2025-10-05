'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/charts/AnalyticsChart';

interface DashboardStats {
  totalUsers?: number;
  totalRevenue?: number;
  tokensSold?: number;
  carbonCredits?: number;
  usersChange?: number;
  revenueChange?: number;
  tokensChange?: number;
  carbonChange?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      // For now, use mock data. In production, fetch from API
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          totalRevenue: 5847230,
          tokensSold: 12847,
          carbonCredits: 3421,
          usersChange: 12.5,
          revenueChange: 8.3,
          tokensChange: 15.2,
          carbonChange: -3.1,
        });
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard stats');
      setLoading(false);
    }
  };

  const revenueData = [
    { label: 'Jan', value: 420000 },
    { label: 'Feb', value: 485000 },
    { label: 'Mar', value: 520000 },
    { label: 'Apr', value: 490000 },
    { label: 'May', value: 545000 },
    { label: 'Jun', value: 587000 },
  ];

  const usageData = [
    { label: 'Mon', value: 1200 },
    { label: 'Tue', value: 1450 },
    { label: 'Wed', value: 1320 },
    { label: 'Thu', value: 1580 },
    { label: 'Fri', value: 1670 },
    { label: 'Sat', value: 980 },
    { label: 'Sun', value: 850 },
  ];

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={loading ? '...' : stats.totalUsers?.toLocaleString() || '0'}
          change={stats.usersChange}
          loading={loading}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Total Revenue"
          value={loading ? '...' : `₦${(stats.totalRevenue || 0).toLocaleString()}`}
          change={stats.revenueChange}
          loading={loading}
          color="green"
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
          title="Tokens Sold"
          value={loading ? '...' : stats.tokensSold?.toLocaleString() || '0'}
          change={stats.tokensChange}
          loading={loading}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
        />

        <StatsCard
          title="Carbon Credits"
          value={loading ? '...' : `${stats.carbonCredits?.toLocaleString()} kg` || '0 kg'}
          change={stats.carbonChange}
          loading={loading}
          color="purple"
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
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Monthly Revenue (₦)"
          data={revenueData}
          type="bar"
          color="#10B981"
          loading={loading}
        />

        <AnalyticsChart
          title="Weekly Usage (kWh)"
          data={usageData}
          type="line"
          color="#3B82F6"
          loading={loading}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </>
          ) : (
            <>
              <TransactionItem
                type="purchase"
                title="Token Purchase"
                user="John Doe"
                amount={15000}
                time="2 hours ago"
              />
              <TransactionItem
                type="usage"
                title="Energy Usage"
                user="Jane Smith"
                amount={-5.2}
                time="4 hours ago"
                unit="kWh"
              />
              <TransactionItem
                type="carbon"
                title="Carbon Credit"
                user="Mike Johnson"
                amount={2.3}
                time="6 hours ago"
                unit="kg CO₂"
              />
              <TransactionItem
                type="purchase"
                title="Token Purchase"
                user="Sarah Williams"
                amount={25000}
                time="8 hours ago"
              />
              <TransactionItem
                type="usage"
                title="Energy Usage"
                user="David Brown"
                amount={-8.7}
                time="12 hours ago"
                unit="kWh"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface TransactionItemProps {
  type: 'purchase' | 'usage' | 'carbon';
  title: string;
  user: string;
  amount: number;
  time: string;
  unit?: string;
}

function TransactionItem({ type, title, user, amount, time, unit }: TransactionItemProps) {
  const icons = {
    purchase: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    usage: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    carbon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const colors = {
    purchase: 'bg-green-100 text-green-600',
    usage: 'bg-blue-100 text-blue-600',
    carbon: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${colors[type]} rounded-lg flex items-center justify-center`}>
          {icons[type]}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{user} • {time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${amount >= 0 ? 'text-green-600' : 'text-gray-900'}`}>
          {amount >= 0 && '+'}
          {unit === 'kWh' || unit === 'kg CO₂' ? amount : `₦${amount.toLocaleString()}`}
          {unit && ` ${unit}`}
        </p>
      </div>
    </div>
  );
}
