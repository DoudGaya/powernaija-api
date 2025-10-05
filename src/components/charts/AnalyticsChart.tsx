'use client';

import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  title: string;
  type?: 'bar' | 'line';
  color?: string;
  height?: number;
  showGrid?: boolean;
  loading?: boolean;
}

export default function AnalyticsChart({
  data,
  title,
  type = 'bar',
  color = '#10B981',
  height = 300,
  showGrid = true,
  loading = false,
}: AnalyticsChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
        <div className={`flex items-end justify-between space-x-2`} style={{ height: `${height}px` }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-1 bg-gray-200 rounded-t animate-pulse" style={{ height: '60%' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="relative" style={{ height: `${height}px` }}>
          {/* Grid lines */}
          {showGrid && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div key={percent} className="flex items-center">
                  <span className="text-xs text-gray-400 w-12 text-right mr-2">
                    {Math.round((maxValue * percent) / 100)}
                  </span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              ))}
            </div>
          )}

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-between space-x-2 pl-14">
            {data.map((item, index) => {
              const heightPercent = (item.value / maxValue) * 100;
              const barColor = item.color || color;

              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${height * (heightPercent / 100)}px`,
                        backgroundColor: barColor,
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.value.toLocaleString()}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Line chart
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Grid lines */}
        {showGrid && (
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div key={percent} className="flex items-center">
                <span className="text-xs text-gray-400 w-12 text-right mr-2">
                  {Math.round((maxValue * percent) / 100)}
                </span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
            ))}
          </div>
        )}

        {/* Line chart */}
        <div className="absolute inset-0 pl-14">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Draw line */}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="3"
              points={data
                .map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - (item.value / maxValue) * 100;
                  return `${x}%,${y}%`;
                })
                .join(' ')}
            />

            {/* Draw points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (item.value / maxValue) * 100;

              return (
                <g key={index}>
                  <circle cx={`${x}%`} cy={`${y}%`} r="5" fill={color} className="cursor-pointer" />
                  <circle cx={`${x}%`} cy={`${y}%`} r="8" fill={color} opacity="0.2" className="cursor-pointer" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Labels */}
        <div className="absolute bottom-0 left-14 right-0 flex justify-between mt-4 pt-4 border-t border-gray-200">
          {data.map((item, index) => (
            <span key={index} className="text-xs text-gray-600 text-center">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
