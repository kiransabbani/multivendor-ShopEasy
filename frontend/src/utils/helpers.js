export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getStockStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'IN_STOCK': return 'badge-green';
    case 'LOW_STOCK': return 'badge-yellow';
    case 'OUT_OF_STOCK': return 'badge-red';
    case 'OVERSTOCK': return 'badge-blue';
    default: return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full';
  }
};

export const getStockStatusLabel = (status) => {
  switch (status?.toUpperCase()) {
    case 'IN_STOCK': return 'In Stock';
    case 'LOW_STOCK': return 'Low Stock';
    case 'OUT_OF_STOCK': return 'Out of Stock';
    case 'OVERSTOCK': return 'Overstock';
    default: return status || 'Unknown';
  }
};

export const getHikeLabelColor = (label) => {
  switch (label?.toLowerCase()) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'moderate': return 'text-yellow-600 bg-yellow-100';
    case 'no increase': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getOrderStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING': return 'badge-yellow';
    case 'PROCESSING': return 'badge-blue';
    case 'SHIPPED': return 'badge-blue';
    case 'DELIVERED': return 'badge-green';
    case 'CANCELLED': return 'badge-red';
    default: return 'badge-gray';
  }
};

export const calculateStockDays = (stock, dailyDemand) => {
  if (!dailyDemand || dailyDemand === 0) return 999;
  return Math.floor(stock / dailyDemand);
};

export const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
};

export const CATEGORY_FALLBACK_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80',
  home: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80',
  sports: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
  toys: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80',
  books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
};

export const getProductImageUrl = (product, index = 0) => {
  if (!product) return CATEGORY_FALLBACK_IMAGES.default;
  const img = Array.isArray(product.images) ? product.images[index] : (product.image || product.images);
  if (img && typeof img === 'string' && !/via\.placeholder\.com|undefined/i.test(img)) {
    return img;
  }
  const category = typeof product.category === 'string'
    ? product.category
    : typeof product.category?.name === 'string'
      ? product.category.name
      : typeof product.category?.slug === 'string'
        ? product.category.slug
        : '';
  const cat = category.toLowerCase();
  return CATEGORY_FALLBACK_IMAGES[cat] || CATEGORY_FALLBACK_IMAGES.default;
};

export const isPersistedProductId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

export const handleImageError = (e, fallbackUrl) => {
  e.target.onerror = null;
  e.target.src = fallbackUrl || CATEGORY_FALLBACK_IMAGES.default;
};
