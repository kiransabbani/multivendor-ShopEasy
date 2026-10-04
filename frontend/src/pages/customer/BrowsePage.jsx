import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import ProductGrid from '../../components/product/ProductGrid';
import { productsAPI, categoriesAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Filter, X } from 'lucide-react';

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recommended');

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategories(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {
        // Fallback categories
        setCategories([
          { _id: '1', name: 'Electronics', slug: 'electronics' },
          { _id: '2', name: 'Fashion', slug: 'fashion' },
          { _id: '3', name: 'Home & Garden', slug: 'home' },
          { _id: '4', name: 'Beauty', slug: 'beauty' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchQuery,
          category: selectedCategory,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          rating: selectedRating,
          ...(inStockOnly ? { inStock: true } : {}),
          sortBy,
          minRating: selectedRating
        };
        const res = await productsAPI.getAll(params);
        setProducts(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {
        // Fallback realistic catalog
        const baseCatalog = [
          { _id: 'b-1', name: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones', category: 'electronics', price: 19990, comparePrice: 24990, rating: 4.8, numReviews: 482, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'AudioTech India' }, stock: 25 },
          { _id: 'b-2', name: "Men's Tailored Oxford Cotton Casual Shirt", category: 'fashion', price: 1499, comparePrice: 2299, rating: 4.6, numReviews: 215, images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Velvet & Vine' }, stock: 40 },
          { _id: 'b-3', name: 'Minimalist Nordic Ceramic Table Lamp', category: 'home', price: 2499, comparePrice: 3499, rating: 4.7, numReviews: 128, images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Living Spaces' }, stock: 15 },
          { _id: 'b-4', name: 'Pure Botanical Vitamin C Radiance Serum', category: 'beauty', price: 899, comparePrice: 1299, rating: 4.9, numReviews: 532, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Organic Glow' }, stock: 65 },
          { _id: 'b-5', name: 'Pro Multi-Sensor Smart Fitness Activity Watch', category: 'electronics', price: 4999, comparePrice: 7999, rating: 4.5, numReviews: 340, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'GadgetZone' }, stock: 18 },
          { _id: 'b-6', name: 'Non-Slip High Density Eco Yoga Mat', category: 'sports', price: 1299, comparePrice: 1899, rating: 4.7, numReviews: 94, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Peak Athletics' }, stock: 30 },
          { _id: 'b-7', name: 'Organic Raw Wild Forest Honey (500g)', category: 'groceries', price: 649, comparePrice: 799, rating: 4.9, numReviews: 410, images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Organic Essentials' }, stock: 55 },
          { _id: 'b-8', name: 'Ergonomic Wireless Silent Click Mouse', category: 'electronics', price: 1199, comparePrice: 1799, rating: 4.6, numReviews: 184, images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'GadgetZone' }, stock: 45 },
          { _id: 'b-9', name: 'Classic Aviator Polarized Sunglasses', category: 'fashion', price: 1899, comparePrice: 2999, rating: 4.7, numReviews: 142, images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Velvet & Vine' }, stock: 22 },
          { _id: 'b-10', name: 'Stainless Steel Insulated Thermal Flask (1L)', category: 'home', price: 999, comparePrice: 1499, rating: 4.8, numReviews: 298, images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Living Spaces' }, stock: 35 },
          { _id: 'b-11', name: 'Natural Clay Purifying Face Mask (100g)', category: 'beauty', price: 749, comparePrice: 999, rating: 4.6, numReviews: 88, images: ['https://images.unsplash.com/photo-1567928815104-b7980ee5032e?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Organic Glow' }, stock: 50 },
          { _id: 'b-12', name: 'Mechanical Gaming Keyboard RGB Backlit', category: 'electronics', price: 3499, comparePrice: 4999, rating: 4.9, numReviews: 312, images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'AudioTech India' }, stock: 12 },
          { _id: 'b-13', name: '4K Smart LED Television', category: 'electronics', price: 32999, comparePrice: 39999, rating: 4.7, numReviews: 96, images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'AudioTech India' }, stock: 24 },
          { _id: 'b-14', name: 'USB-C Fast Charging Power Bank', category: 'electronics', price: 1799, comparePrice: 2499, rating: 4.6, numReviews: 187, images: ['https://images.unsplash.com/photo-1609592424498-7f2f0a3f2c73?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'GadgetZone' }, stock: 140 },
          { _id: 'b-15', name: 'Linen Blend Everyday Kurta', category: 'fashion', price: 1899, comparePrice: 2499, rating: 4.5, numReviews: 74, images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Velvet & Vine' }, stock: 85 },
          { _id: 'b-16', name: 'Adjustable Standing Desk', category: 'home', price: 15499, comparePrice: 18999, rating: 4.8, numReviews: 63, images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6b0?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Living Spaces' }, stock: 18 },
          { _id: 'b-17', name: 'Insulated Stainless Steel Bottle', category: 'home', price: 999, comparePrice: 1499, rating: 4.7, numReviews: 221, images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Living Spaces' }, stock: 120 },
          { _id: 'b-18', name: 'Resistance Bands Training Kit', category: 'sports', price: 1299, comparePrice: 1799, rating: 4.6, numReviews: 115, images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Peak Athletics' }, stock: 70 },
          { _id: 'b-19', name: 'The Art of Everyday Cooking', category: 'books', price: 699, comparePrice: 899, rating: 4.8, numReviews: 54, images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'BookWorld' }, stock: 95 },
          { _id: 'b-20', name: 'Daily Wellness Herbal Tea Box', category: 'groceries', price: 549, comparePrice: 699, rating: 4.7, numReviews: 132, images: ['https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500&auto=format&fit=crop&q=80'], vendor: { storeName: 'Organic Essentials' }, stock: 130 },
        ];

        let filtered = [...baseCatalog];
        if (selectedCategory) {
          filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (searchQuery) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (priceRange.min > 0) {
          filtered = filtered.filter(p => p.price >= priceRange.min);
        }
        if (priceRange.max < 100000) {
          filtered = filtered.filter(p => p.price <= priceRange.max);
        }
        if (selectedRating > 0) {
          filtered = filtered.filter(p => p.rating >= selectedRating);
        }
        if (inStockOnly) {
          filtered = filtered.filter(p => p.stock > 0);
        }

        if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
        if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);

        setProducts(filtered);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, selectedCategory, priceRange, selectedRating, inStockOnly, sortBy]);

  const handleCategoryChange = (slug) => {
    setSelectedCategory(selectedCategory === slug ? '' : slug);
    if (selectedCategory === slug) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat._id} className="flex items-center">
              <input 
                type="checkbox" 
                checked={selectedCategory === cat.slug}
                onChange={() => handleCategoryChange(cat.slug)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            value={priceRange.min}
            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
            className="w-full border border-gray-300 rounded px-2 py-1"
            placeholder="Min"
          />
          <span className="text-gray-500">-</span>
          <input 
            type="number" 
            value={priceRange.max}
            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
            className="w-full border border-gray-300 rounded px-2 py-1"
            placeholder="Max"
          />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-4">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center">
              <input 
                type="radio" 
                name="rating"
                checked={selectedRating === rating}
                onChange={() => setSelectedRating(rating)}
                className="text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 text-gray-700">{rating}+ Stars</span>
            </label>
          ))}
          <label className="flex items-center">
            <input 
              type="radio" 
              name="rating"
              checked={selectedRating === 0}
              onChange={() => setSelectedRating(0)}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="ml-2 text-gray-700">Any Rating</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
        <label className="flex items-center">
          <input 
            type="checkbox" 
            checked={inStockOnly}
            onChange={() => setInStockOnly(!inStockOnly)}
            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          <span className="ml-2 text-gray-700">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {searchQuery && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Search results for &quot;{searchQuery}&quot;</h1>
          <p className="text-gray-500">{products.length} items found</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-lg"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
          
          {/* Mobile Sort */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowMobileFilters(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl h-full overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar />
              </div>
              <div className="mt-auto p-4 border-t">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Top Bar */}
          <div className="hidden lg:flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
            <span className="text-gray-600">Showing {products.length} products</span>
            <div className="flex items-center">
              <span className="mr-3 text-gray-600">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-gray-50 rounded-lg px-4 py-2 font-medium focus:ring-0"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : products.length > 0 ? (
            <ProductGrid>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <div className="text-gray-400 mb-4 flex justify-center">
                <Filter className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => {
                  setSelectedCategory('');
                  setPriceRange({ min: 0, max: 100000 });
                  setSelectedRating(0);
                  setInStockOnly(false);
                }}
                className="mt-6 text-blue-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
