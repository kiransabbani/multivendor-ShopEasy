import React from 'react';

const ProductGrid = ({ children, title, viewAllLink }) => {
  return (
    <div className="py-8">
      {(title || viewAllLink) && (
        <div className="flex justify-between items-end mb-6">
          {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
          {viewAllLink && (
            <a href={viewAllLink} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              View All &rarr;
            </a>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {children}
      </div>
    </div>
  );
};

export default ProductGrid;
