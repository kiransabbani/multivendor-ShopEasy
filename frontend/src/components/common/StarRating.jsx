import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating, count }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    } else {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">{stars}</div>
      {count !== undefined && <span className="text-sm text-gray-500">({count})</span>}
    </div>
  );
};

export default StarRating;
