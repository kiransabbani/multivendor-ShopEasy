import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearchSubmit }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/browse?search=${encodeURIComponent(query)}`);
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <input
        type="text"
        placeholder="Search for products, brands and more..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
      />
      <button 
        type="submit" 
        className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-blue-600"
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
};

export default SearchBar;
