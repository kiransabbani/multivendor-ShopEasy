import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import ProductGrid from '../../components/product/ProductGrid';
import { productsAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ShieldCheck, Star, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { handleImageError } from '../../utils/helpers';

const categories = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Home', icon: '🏠' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Toys', icon: '🧸' },
  { name: 'Books', icon: '📚' },
  { name: 'Groceries', icon: '🛒' },
];

const CURATED_FEATURED = [
  {
    _id: 'prod-f1',
    name: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
    category: 'Electronics',
    price: 19990,
    comparePrice: 24990,
    rating: 4.8,
    numReviews: 482,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'AudioTech India' }
  },
  {
    _id: 'prod-f2',
    name: "Men's Tailored Oxford Cotton Casual Shirt",
    category: 'Fashion',
    price: 1499,
    comparePrice: 2299,
    rating: 4.6,
    numReviews: 215,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Velvet & Vine' }
  },
  {
    _id: 'prod-f3',
    name: 'Minimalist Nordic Ceramic Table Lamp',
    category: 'Home',
    price: 2499,
    comparePrice: 3499,
    rating: 4.7,
    numReviews: 128,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Living Spaces' }
  },
  {
    _id: 'prod-f4',
    name: 'Pure Botanical Vitamin C Radiance Serum (30ml)',
    category: 'Beauty',
    price: 899,
    comparePrice: 1299,
    rating: 4.9,
    numReviews: 532,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Organic Glow' }
  },
  {
    _id: 'prod-f5',
    name: 'Pro Multi-Sensor Smart Fitness Activity Watch',
    category: 'Electronics',
    price: 4999,
    comparePrice: 7999,
    rating: 4.5,
    numReviews: 340,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'GadgetZone' }
  },
  {
    _id: 'prod-f6',
    name: 'Non-Slip High Density Eco Yoga Mat',
    category: 'Sports',
    price: 1299,
    comparePrice: 1899,
    rating: 4.7,
    numReviews: 94,
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Peak Athletics' }
  },
  {
    _id: 'prod-f7',
    name: 'Organic Raw Wild Forest Honey (500g)',
    category: 'Groceries',
    price: 649,
    comparePrice: 799,
    rating: 4.9,
    numReviews: 410,
    images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Organic Essentials' }
  },
  {
    _id: 'prod-f8',
    name: 'Ergonomic Wireless Silent Click Mouse',
    category: 'Electronics',
    price: 1199,
    comparePrice: 1799,
    rating: 4.6,
    numReviews: 184,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'GadgetZone' }
  },
  {
    _id: 'prod-f9',
    name: 'Mechanical RGB Gaming Keyboard (Compact TKL)',
    category: 'Electronics',
    price: 3499,
    comparePrice: 5499,
    rating: 4.9,
    numReviews: 312,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'AudioTech India' }
  },
  {
    _id: 'prod-f10',
    name: 'Classic Aviator Polarized Sunglasses',
    category: 'Fashion',
    price: 1899,
    comparePrice: 2999,
    rating: 4.7,
    numReviews: 142,
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Velvet & Vine' }
  },
  {
    _id: 'prod-f11',
    name: 'Stainless Steel Insulated Thermal Flask (1L)',
    category: 'Home',
    price: 999,
    comparePrice: 1499,
    rating: 4.8,
    numReviews: 298,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Living Spaces' }
  },
  {
    _id: 'prod-f12',
    name: 'Natural Clay Purifying Face Mask (100g)',
    category: 'Beauty',
    price: 749,
    comparePrice: 999,
    rating: 4.6,
    numReviews: 88,
    images: ['https://images.unsplash.com/photo-1567928815104-b7980ee5032e?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Organic Glow' }
  },
  {
    _id: 'prod-f13',
    name: '4K Smart LED Television 43"',
    category: 'Electronics',
    price: 32999,
    comparePrice: 39999,
    rating: 4.7,
    numReviews: 96,
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'AudioTech India' }
  },
  {
    _id: 'prod-f14',
    name: 'USB-C 65W Fast Charging Power Bank (20000mAh)',
    category: 'Electronics',
    price: 1799,
    comparePrice: 2499,
    rating: 4.6,
    numReviews: 187,
    images: ['https://images.unsplash.com/photo-1609592424498-7f2f0a3f2c73?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'GadgetZone' }
  },
  {
    _id: 'prod-f15',
    name: 'Premium Linen Blend Everyday Kurta',
    category: 'Fashion',
    price: 1899,
    comparePrice: 2499,
    rating: 4.5,
    numReviews: 74,
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Velvet & Vine' }
  },
  {
    _id: 'prod-f16',
    name: 'Adjustable Electric Standing Desk',
    category: 'Home',
    price: 15499,
    comparePrice: 18999,
    rating: 4.8,
    numReviews: 63,
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6b0?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Living Spaces' }
  },
  {
    _id: 'prod-f17',
    name: 'Resistance Bands Full Body Training Kit',
    category: 'Sports',
    price: 1299,
    comparePrice: 1799,
    rating: 4.6,
    numReviews: 115,
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Peak Athletics' }
  },
  {
    _id: 'prod-f18',
    name: 'The Art of Everyday Cooking — Premium Hardcover',
    category: 'Books',
    price: 699,
    comparePrice: 899,
    rating: 4.8,
    numReviews: 54,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'BookWorld' }
  },
  {
    _id: 'prod-f19',
    name: 'Daily Wellness Herbal Tea Assortment Box (40 bags)',
    category: 'Groceries',
    price: 549,
    comparePrice: 699,
    rating: 4.7,
    numReviews: 132,
    images: ['https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'Organic Essentials' }
  },
  {
    _id: 'prod-f20',
    name: 'Creative STEM Building Blocks Set (240 pcs)',
    category: 'Toys',
    price: 1199,
    comparePrice: 1599,
    rating: 4.8,
    numReviews: 178,
    images: ['https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=500&auto=format&fit=crop&q=80'],
    vendor: { storeName: 'KidsWorld' }
  }
];

const FEATURED_VENDORS = [
  {
    name: 'AudioTech India',
    category: 'Electronics & Audio',
    rating: 4.9,
    products: '1.4k Items',
    badge: 'Verified Manufacturer',
    avatar: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    link: '/browse?category=electronics'
  },
  {
    name: 'Velvet & Vine',
    category: 'Fashion & Apparel',
    rating: 4.8,
    products: '820 Items',
    badge: 'Top Rated Brand',
    avatar: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=120&auto=format&fit=crop&q=80',
    link: '/browse?category=fashion'
  },
  {
    name: 'GadgetZone',
    category: 'Smart Devices',
    rating: 4.7,
    products: '2.1k Items',
    badge: 'Fast Dispatch',
    avatar: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=120&auto=format&fit=crop&q=80',
    link: '/browse?category=electronics'
  },
  {
    name: 'Organic Essentials',
    category: 'Groceries & Wellness',
    rating: 4.9,
    products: '450 Items',
    badge: '100% Certified',
    avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
    link: '/browse?category=groceries'
  },
  {
    name: 'Living Spaces',
    category: 'Home & Furniture',
    rating: 4.8,
    products: '640 Items',
    badge: 'Premium Quality',
    avatar: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=120&auto=format&fit=crop&q=80',
    link: '/browse?category=home'
  },
  {
    name: 'Peak Athletics',
    category: 'Sports & Fitness',
    rating: 4.7,
    products: '310 Items',
    badge: 'Pro Gear Partner',
    avatar: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=120&auto=format&fit=crop&q=80',
    link: '/browse?category=sports'
  }
];

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, trendingRes] = await Promise.all([
          productsAPI.getFeatured().catch(() => ({ data: [] })),
          productsAPI.getTrending().catch(() => ({ data: [] }))
        ]);
        
        const featuredData = featuredRes.data?.data?.length > 0 ? featuredRes.data.data : CURATED_FEATURED;
        const trendingData = trendingRes.data?.data?.length > 0 ? trendingRes.data.data : [...CURATED_FEATURED].reverse();

        setFeaturedProducts(featuredData);
        setTrendingProducts(trendingData);
      } catch (error) {
        setFeaturedProducts(CURATED_FEATURED);
        setTrendingProducts([...CURATED_FEATURED].reverse());
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> India&apos;s Premier Multi-Vendor AI Marketplace
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
              Shop Directly from <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-sky-300 to-indigo-200">
                India&apos;s Best Vendors
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 mb-8 max-w-lg leading-relaxed">
              AI-driven demand forecasting, authentic artisan & factory direct products, instant vendor payouts, and express delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/browse" className="bg-white text-blue-900 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-blue-50 transition-all text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Explore Marketplace
              </Link>
              <Link to="/vendor/register" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all text-center backdrop-blur-sm">
                Become a Vendor
              </Link>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-8">
              <div>
                <p className="text-3xl font-extrabold text-white">500+</p>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mt-0.5">Verified Vendors</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-3xl font-extrabold text-white">10,000+</p>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mt-0.5">Active Products</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <p className="text-3xl font-extrabold text-white">99.8%</p>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mt-0.5">Positive Reviews</p>
              </div>
            </div>
          </div>

          {/* Floating Product Preview Showcase */}
          <div className="md:w-1/2 relative hidden md:flex items-center justify-center min-h-[400px]">
            {/* Main Product Card */}
            <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-2xl w-72 transform -rotate-3 hover:rotate-0 transition-transform duration-500 border border-white/40 backdrop-blur-md">
              <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80" 
                  alt="Sony Headphones" 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e)}
                />
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  20% OFF
                </span>
                <span className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" /> 4.8
                </span>
              </div>
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">AudioTech India</div>
              <h3 className="font-bold text-sm text-gray-900 truncate mt-0.5">Sony WH-1000XM4 ANC</h3>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-lg font-extrabold text-gray-900">₹19,990</span>
                <span className="text-xs text-gray-400 line-through">₹24,990</span>
              </div>
            </div>

            {/* Overlapping Secondary Card */}
            <div className="absolute top-4 right-4 bg-white/95 text-gray-900 p-4 rounded-2xl shadow-2xl w-64 transform rotate-6 hover:rotate-0 transition-transform duration-500 border border-white/60">
              <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80" 
                  alt="Minimalist Chrono Watch" 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e)}
                />
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Trending
                </span>
              </div>
              <div className="text-xs text-purple-600 font-bold uppercase tracking-wider">GadgetZone</div>
              <h3 className="font-bold text-sm text-gray-900 truncate mt-0.5">Minimalist Chrono Watch</h3>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-lg font-extrabold text-gray-900">₹4,999</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">In Stock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Strip */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex space-x-6 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                to={`/browse?category=${cat.name.toLowerCase()}`}
                className="flex flex-col items-center min-w-fit flex-shrink-0 group py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-50 group-hover:scale-105 rounded-full flex items-center justify-center text-xl transition-all mb-1.5 shadow-sm">
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Products */}
        <ProductGrid title="Curated Featured Products" viewAllLink="/browse">
          {featuredProducts.slice(0, 8).map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </ProductGrid>

        {/* Special Flash Deals Banner */}
        <div className="my-12 bg-gradient-to-r from-orange-600 via-rose-600 to-red-600 rounded-3xl overflow-hidden shadow-xl flex flex-col lg:flex-row items-center justify-between p-8 md:p-12 text-white relative">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 skew-x-12 pointer-events-none" />
          <div className="mb-8 lg:mb-0 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> Flash Deals of the Day
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
              Up to 50% OFF on Top Consumer Tech
            </h2>
            <p className="text-orange-100 text-base mb-6">
              Exclusive vendor-direct pricing with complimentary express delivery across India.
            </p>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center border border-white/10 min-w-[64px]">
                <span className="block text-2xl font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] text-orange-200 uppercase font-semibold">Hours</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center border border-white/10 min-w-[64px]">
                <span className="block text-2xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] text-orange-200 uppercase font-semibold">Mins</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center border border-white/10 min-w-[64px]">
                <span className="block text-2xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] text-orange-200 uppercase font-semibold">Secs</span>
              </div>
            </div>
            <Link to="/browse?category=electronics" className="inline-flex items-center bg-white text-red-600 px-7 py-3 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors shadow-lg">
              Shop Flash Sale <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="lg:w-2/5 flex justify-center z-10">
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=700&auto=format&fit=crop&q=80" 
                alt="Electronics Sale" 
                onError={(e) => handleImageError(e)}
                className="rounded-2xl shadow-2xl max-h-72 object-cover border-4 border-white/20 transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-3 -left-3 bg-white text-gray-900 px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold">142 people browsing now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Now */}
        <ProductGrid title="Trending Now 🔥" viewAllLink="/browse?sort=trending">
          {trendingProducts.slice(0, 8).map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </ProductGrid>

        {/* New Arrivals Section */}
        <ProductGrid title="New Arrivals ✨" viewAllLink="/browse?sort=newest">
          {[...CURATED_FEATURED].slice(8, 16).map(product => (
            <ProductCard key={`new-${product._id}`} product={{ ...product, _id: `new-${product._id}` }} />
          ))}
        </ProductGrid>

        {/* Featured Vendors Section */}
        <div className="py-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Merchant Stores</h2>
              <p className="text-sm text-gray-500 mt-1">Verified direct sellers and high-velocity marketplace creators</p>
            </div>
            <Link to="/browse" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_VENDORS.map((v, i) => (
              <Link 
                key={i} 
                to={v.link} 
                className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center space-x-3.5 mb-4">
                  <img 
                    src={v.avatar} 
                    alt={v.name}
                    onError={(e) => handleImageError(e)}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary-100 group-hover:scale-105 transition-transform" 
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{v.name}</h3>
                    <p className="text-xs text-gray-500">{v.category}</p>
                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-semibold">{v.rating}</span>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span>{v.products}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 mr-1" /> {v.badge}
                  </span>
                  <span className="text-gray-400 group-hover:text-primary-600 font-medium flex items-center">
                    Visit &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Why Choose Us Trust Indicators */}
        <div className="py-12 mb-8 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Free Express Shipping', desc: 'Complimentary shipping on qualifying orders over ₹999' },
              { icon: '🔄', title: '7-Day Return Guarantee', desc: 'No questions asked hassle-free doorstep pickup' },
              { icon: '🔒', title: '100% Secure Checkout', desc: '256-bit encryption with UPI, cards and Netbanking' },
              { icon: '🎧', title: '24/7 Dedicated Support', desc: 'Priority customer care and dispute escalation' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl text-center border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="font-bold text-gray-900 mb-1.5">{feature.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
