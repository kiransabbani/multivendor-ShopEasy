import React from 'react';

const statusConfig = {
  // Order statuses
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
  SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shipped' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  RETURNED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Returned' },
  // Stock statuses
  IN_STOCK: { bg: 'bg-green-100', text: 'text-green-800', label: 'In Stock' },
  LOW_STOCK: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Low Stock' },
  OUT_OF_STOCK: { bg: 'bg-red-100', text: 'text-red-800', label: 'Out of Stock' },
  OVERSTOCK: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Overstock' },
  // Vendor statuses
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
  SUSPENDED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
  // Payment
  PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
  UNPAID: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Unpaid' },
  // Production
  IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  // Hike levels
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
  MODERATE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Moderate' },
  NONE: { bg: 'bg-green-100', text: 'text-green-800', label: 'No Increase' },
};

const StatusBadge = ({ status, customLabel }) => {
  const config = statusConfig[status?.toUpperCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {customLabel || config.label}
    </span>
  );
};

export default StatusBadge;
