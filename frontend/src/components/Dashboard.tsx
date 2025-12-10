import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import { User, Product, Order } from '../types';

interface EnhancedProductCardProps {
  product: Product;
  onDelete?: (productId: number) => void;
}

function ProductCard({ product, onDelete }: EnhancedProductCardProps) {
  const { formatPrice } = useCurrency();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showFullQR, setShowFullQR] = useState(false);
  const productUrl = `${window.location.origin}/product/${product.id}`;

  useEffect(() => {
    QRCode.toDataURL(productUrl, { width: 256, height: 256 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR Code generation failed:', err));
  }, [product.id]);

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      // Could add a toast notification here
      alert('Product URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL');
    }
  };

  return (
    <>
      <div className="product-card">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {product.image && product.image.trim() ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center';
                    placeholder.innerHTML = `
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    `;
                    parent.replaceChild(placeholder, e.currentTarget);
                  }
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="font-semibold text-green-600">{formatPrice(product.price)}</span>
                  <span>Stock: {product.stock_quantity}</span>
                  {product.size && <span>Size: {product.size}</span>}
                  {product.color && <span>Color: {product.color}</span>}
                </div>
              </div>

              {/* QR Code - Enhanced */}
              <div className="ml-4 flex-shrink-0">
                {qrCodeUrl ? (
                  <div className="qr-code cursor-pointer group" onClick={() => setShowFullQR(true)}>
                    <div className="relative">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        className="w-24 h-24 rounded-xl border-2 border-gray-200 group-hover:border-blue-500 transition-all duration-200 shadow-md group-hover:shadow-lg" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        QR
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-2 font-medium">Scan to View Product</p>
                    <p className="text-xs text-gray-400 text-center mt-1">Click to enlarge</p>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M6.01 18.704C5.272 18.074 4 16.678 4 14.528c0-4.901 3.44-10.567 7.103-12.6a.375.375 0 01.394 0c3.662 1.934 7.103 7.6 7.103 12.6 0 2.15-1.272 3.546-2.01 4.176M6.105 18.704l2.22-2.22m4.532 0l2.22 2.22M12 12V7.88" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Product URL */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">Product URL:</span>
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline truncate"
                >
                  {productUrl}
                </a>
                <button
                  onClick={copyUrlToClipboard}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  title="Copy URL"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-4 pt-4 border-t border-gray-200">
              <Link
                to={`/products/new?id=${product.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              <button
                onClick={() => onDelete?.(product.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-2.188L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <a
                href={`${productUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Page
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal - Enhanced */}
      {showFullQR && qrCodeUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-95 animate-scale-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M6.01 18.704C5.272 18.074 4 16.678 4 14.528c0-4.901 3.44-10.567 7.103-12.6a.375.375 0 01.394 0c3.662 1.934 7.103 7.6 7.103 12.6 0 2.15-1.272 3.546-2.01 4.176M6.105 18.704l2.22-2.22m4.532 0l2.22 2.22M12 12V7.88" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Product QR Code</h3>
              <p className="text-gray-600 mb-6">Scan this QR code to instantly view the product page</p>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
                <img 
                  src={qrCodeUrl} 
                  alt="Full QR Code" 
                  className="mx-auto w-72 h-72 border-4 border-white shadow-lg rounded-lg" 
                />
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Product URL:</p>
                <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <code className="text-sm text-gray-600 truncate">{productUrl}</code>
                  <button
                    onClick={copyUrlToClipboard}
                    className="ml-2 text-blue-600 hover:text-blue-700"
                    title="Copy URL"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={copyUrlToClipboard}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Copy URL
                </button>
                <button
                  onClick={() => setShowFullQR(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Dashboard() {
  const auth = useAuth() as any;
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ 
    totalProducts: 0, 
    pendingOrders: 0, 
    completedOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalCustomers: 0
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export');
      return;
    }

    // Group orders by customer (name + phone as unique identifier)
    const customerGroups: { [key: string]: any[] } = {};

    orders.forEach(order => {
      const key = `${order.customer_name}_${order.customer_phone}`;
      if (!customerGroups[key]) {
        customerGroups[key] = [];
      }
      customerGroups[key].push(order);
    });

    // Create summary rows for each customer
    const customerSummaryRows: any[] = [];
    let totalRevenue = 0;
    let totalOrders = 0;

    Object.entries(customerGroups).forEach(([customerKey, customerOrders]) => {
      const firstOrder = customerOrders[0];
      const totalAmount = customerOrders.reduce((sum, order) => sum + order.amount, 0);
      const orderCount = customerOrders.length;
      const productsOrdered = [...new Set(customerOrders.map(o => o.product_name))].join('; ');

      customerSummaryRows.push({
        customerName: firstOrder.customer_name,
        phone: firstOrder.customer_phone,
        address: firstOrder.delivery_address,
        products: productsOrdered,
        totalOrders: orderCount,
        totalAmount: totalAmount,
        firstOrderDate: new Date(Math.min(...customerOrders.map(o => new Date(o.created_at).getTime()))).toLocaleDateString(),
        lastOrderDate: new Date(Math.max(...customerOrders.map(o => new Date(o.created_at).getTime()))).toLocaleDateString(),
        orderStatuses: [...new Set(customerOrders.map(o => o.order_status))].join('/')
      });

      totalRevenue += totalAmount;
      totalOrders += orderCount;
    });

    const headers = [
      'Customer Name',
      'Phone',
      'Delivery Address',
      'Products Ordered',
      'Total Orders',
      'Total Amount (₹)',
      'Order Status(es)',
      'First Order Date',
      'Last Order Date'
    ];

    const csvContent = [
      headers.join(','),
      ...customerSummaryRows.map(row => [
        `"${row.customerName}"`,
        `"${row.phone}"`,
        `"${row.address.replace(/"/g, '""')}"`,
        `"${row.products}"`,
        row.totalOrders,
        row.totalAmount,
        `"${row.orderStatuses}"`,
        row.firstOrderDate,
        row.lastOrderDate
      ].join(',')),
      '', // Empty row
      `Total Customers,${customerSummaryRows.length},Total Orders,${totalOrders},Total Revenue (₹),${totalRevenue}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customer_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Fetch products
    fetch('/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Ensure image URLs are absolute
          const productsWithAbsoluteImages = data.map(product => ({
            ...product,
            image: product.image && !product.image.startsWith('http') 
              ? `http://localhost:3001${product.image}` 
              : product.image
          }));
          setProducts(productsWithAbsoluteImages);
          setStats(prev => ({ ...prev, totalProducts: data.length }));
          
          // Generate category data
          const categories: Record<string, number> = {};
          data.forEach(product => {
            const category = product.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + 1;
          });
          
          const categoryChartData = Object.entries(categories).map(([name, value]) => ({
            name,
            value,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
          }));
          setCategoryData(categoryChartData);
        }
      })
      .catch(err => console.error(err));

    // Fetch orders
    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Ensure image URLs are absolute for orders too
          const ordersWithAbsoluteImages = data.map(order => ({
            ...order,
            image: order.image && !order.image.startsWith('http') 
              ? `http://localhost:3001${order.image}` 
              : order.image
          }));
          setOrders(ordersWithAbsoluteImages);
          
          const pendingOrders = data.filter(order => order.order_status.toLowerCase() === 'pending').length;
          const completedOrders = data.filter(order => order.order_status.toLowerCase() === 'completed').length;
          const totalRevenue = data.reduce((sum, order) => sum + order.amount, 0);
          const avgOrderValue = data.length > 0 ? totalRevenue / data.length : 0;
          const uniqueCustomers = [...new Set(data.map(order => order.customer_phone))].length;
          
          setStats(prev => ({ 
            ...prev, 
            pendingOrders, 
            completedOrders,
            totalRevenue,
            avgOrderValue,
            totalCustomers: uniqueCustomers
          }));
          
          // Generate sales data (last 7 days)
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
          }).reverse();
          
          const salesByDay: Record<string, number> = {};
          last7Days.forEach(day => {
            salesByDay[day] = 0;
          });
          
          data.forEach(order => {
            const orderDate = new Date(order.created_at).toISOString().split('T')[0];
            if (salesByDay[orderDate] !== undefined) {
              salesByDay[orderDate] += order.amount;
            }
          });
          
          const salesChartData = last7Days.map(day => ({
            date: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
            sales: salesByDay[day]
          }));
          
          setSalesData(salesChartData);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" style={{
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}>
        <div className="content-wrapper py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-8 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Welcome back, {auth.user?.first_name}! 👋
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                Your live sales dashboard is ready. Track your products, manage orders, and grow your business.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products/new"
                className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </Link>
              <Link
                to="/orders"
                className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="content-wrapper -mt-8 md:-mt-12 pb-6 md:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {/* First Row - 3 cards */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 hover:shadow-xl md:hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Total Products</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{stats.totalProducts}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 hover:shadow-xl md:hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Completed Orders</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{stats.completedOrders}</p>
                <p className="text-xs text-green-600 mt-1">+8% this week</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 hover:shadow-xl md:hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Pending Orders</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{stats.pendingOrders}</p>
                <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
              </div>
            </div>
          </div>

          {/* Second Row - 3 cards (wider for revenue) */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 hover:shadow-xl md:hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-lg md:text-2xl font-bold text-gray-900 break-words">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-green-600 mt-1">Growth rate: +15%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 hover:shadow-xl md:hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Total Customers</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{stats.totalCustomers}</p>
                <p className="text-xs text-green-600 mt-1">+5 new this week</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 hover:shadow-xl md:hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center">
              <div className="p-2 md:p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg md:rounded-xl">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <h3 className="text-xs md:text-sm font-medium text-gray-500">Avg Order Value</h3>
                <p className="text-lg md:text-2xl font-bold text-gray-900 break-words">{formatPrice(stats.avgOrderValue)}</p>
                <p className="text-xs text-green-600 mt-1">+8% from last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="content-wrapper pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Sales Trend (Last 7 Days)</h3>
            <div className="h-64">
              {salesData.length > 0 ? (
                <div className="flex items-end h-48 space-x-2">
                  {salesData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-2">{item.date}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg transition-all duration-300 hover:opacity-80"
                        style={{ height: `${Math.max(20, (item.sales / Math.max(...salesData.map(d => d.sales)) * 100))}%` }}
                      ></div>
                      <div className="text-xs font-medium text-gray-700 mt-2">
                        {formatPrice(item.sales)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-600">No sales data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Product Categories</h3>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          <span className="text-sm text-gray-600">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${(item.value / stats.totalProducts) * 100}%`,
                              backgroundColor: item.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-600">No category data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Products */}
      <div className="content-wrapper pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h3>
              <div className="space-y-4">
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <img
                      src={order.image || '/placeholder-product.png'}
                      alt={order.product_name}
                      className="w-10 h-10 rounded-lg object-cover mr-4"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDEwaDc3mswQ4o11aGVnSHJ5OGhkVXJzZmwyOWpYaEZsNHAzeGxMZzZaTVJFRiIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{order.product_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{order.amount.toLocaleString('en-IN')}</p>
                      <span className={`inline-block w-2 h-2 rounded-full ${order.order_status === 'delivered' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-6">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-600">No orders yet</p>
                  </div>
                )}
              </div>
              {orders.length > 0 && (
                <div className="mt-6">
                  <Link
                    to="/orders"
                    className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                  >
                    View All Orders
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Your Products</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={exportOrdersToCSV}
                      disabled={orders.length === 0}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Export Orders
                    </button>
                    <Link
                      to="/products/new"
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600"
                    >
                      Add Product
                    </Link>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                    <p className="text-gray-600 mb-6">Start building your live sales catalog!</p>
                    <Link
                      to="/products/new"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Your First Product
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {products.slice(0, 3).map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                    {products.length > 3 && (
                      <div className="text-center pt-4">
                        <Link
                          to="/products"
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          View all {products.length} products →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
