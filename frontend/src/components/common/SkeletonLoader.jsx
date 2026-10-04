import React from 'react';

const Pulse = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <Pulse className="h-4 w-24 mb-3" />
    <Pulse className="h-8 w-32 mb-2" />
    <Pulse className="h-3 w-20" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols, columns }) => {
  const colCount = columns ?? cols ?? 5;
  return (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-4 border-b border-gray-100 bg-gray-50">
      <Pulse className="h-9 w-64" />
    </div>
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {Array(colCount).fill().map((_, i) => (
            <th key={i} className="px-6 py-4"><Pulse className="h-3 w-20" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array(rows).fill().map((_, r) => (
          <tr key={r} className="border-b border-gray-50">
            {Array(colCount).fill().map((_, c) => (
              <td key={c} className="px-6 py-4"><Pulse className="h-4 w-24" /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Pulse className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array(4).fill().map((_, i) => <CardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Pulse className="h-5 w-40 mb-6" />
        <Pulse className="h-64 w-full" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <Pulse className="h-5 w-40 mb-6" />
        <Pulse className="h-64 w-full" />
      </div>
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <Pulse className="h-5 w-40 mb-6" />
    <Pulse className="h-72 w-full" />
  </div>
);

export default { CardSkeleton, TableSkeleton, DashboardSkeleton, ChartSkeleton };
