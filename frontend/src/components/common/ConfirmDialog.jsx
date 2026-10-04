import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  // Support both onClose and onCancel (used differently across pages)
  onClose, 
  onCancel,
  onConfirm, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  // Support both confirmLabel and confirmText
  confirmLabel, 
  confirmText,
  // Support both confirmColor and type
  confirmColor,
  type,
  loading = false 
}) => {
  if (!isOpen) return null;

  const handleClose = onClose || onCancel || (() => {});
  const buttonLabel = confirmLabel || confirmText || 'Confirm';
  
  // Map type to color if needed
  const resolvedColor = confirmColor || (type === 'danger' ? 'red' : type === 'warning' ? 'red' : 'red');

  const colorMap = {
    red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorMap[resolvedColor] || colorMap.red} disabled:opacity-50`}
          >
            {loading ? 'Processing...' : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

