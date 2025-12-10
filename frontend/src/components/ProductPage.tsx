import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrency } from '../hooks/useCurrency';
import QRCode from 'qrcode';

export default function ProductPage() {
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    quantity: 1,
    selected_size: product?.size || '',
    selected_color: product?.color || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
        
        // Generate QR code for product URL
        const productUrl = `${window.location.origin}/product/${id}`;
        QRCode.toDataURL(productUrl, { width: 256, height: 256 })
          .then(url => setQrCodeUrl(url))
          .catch(err => console.error('QR Code generation failed:', err));
      })
      .catch(err => {
        console.error('Failed to load product:', err);
        setLoading(false);
      });
  }, [id]);

  const copyProductUrl = async () => {
    const productUrl = `${window.location.origin}/product/${id}`;
    try {
      await navigator.clipboard.writeText(productUrl);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL');
    }
  };

  const handleOrderChange = (e) => {
    setOrderForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        product_id: product.id,
        ...orderForm,
        amount: product.price * orderForm.quantity
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Store order details for confirmation page
      setOrderDetails({
        ...orderData,
        order_id: data.id || Date.now(),
        product_name: product.name,
        product_price: product.price,
        product_image: product.image,
        order_date: new Date().toLocaleString()
      });
      
      setOrderPlaced(true);
      setShowSuccessPopup(true);
      
      // Hide success popup after 3 seconds
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // If order is placed, show confirmation page instead of product page
  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 animate-gradient">
        <div className="max-w-2xl w-full">
          {/* Enhanced Success Animation */}
          <div className="text-center mb-12">
            {/* Confetti Animation Container */}
            <div className="relative h-48 mb-8">
              {/* Main Success Icon with Multiple Animations */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Outer Ring - Pulsing */}
                  <div className="absolute inset-0 w-40 h-40 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20 animate-ping"></div>
                  
                  {/* Middle Ring - Spinning */}
                  <div className="absolute inset-0 w-36 h-36 border-4 border-green-300 border-t-transparent rounded-full animate-spin-slow"></div>
                  
                  {/* Inner Circle - Pulse */}
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                    <svg className="w-20 h-20 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  {/* Floating Particles */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-float-slow"></div>
                  <div className="absolute -top-4 -right-4 w-6 h-6 bg-pink-400 rounded-full animate-float-medium"></div>
                  <div className="absolute -bottom-4 -left-4 w-7 h-7 bg-blue-400 rounded-full animate-float-fast"></div>
                  <div className="absolute -bottom-4 -right-4 w-5 h-5 bg-purple-400 rounded-full animate-float-slow"></div>
                </div>
              </div>
            </div>
            
            {/* Animated Text */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 animate-fade-in-up">
                Order Placed Successfully! <span className="animate-bounce">🎉</span>
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full animate-expand"></div>
              <p className="text-2xl text-gray-700 animate-fade-in-up-delay">
                Thank you for your order! <span className="inline-block animate-wave">🙏</span>
              </p>
              <p className="text-lg text-gray-600 animate-fade-in-up-delay-2">
                Your order has been confirmed and here are the details:
              </p>
            </div>
          </div>

          {/* Order Confirmation Card with Animation */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 transform transition-all duration-500 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Customer Details */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Customer Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Ordered By</p>
                    <p className="text-lg font-semibold text-gray-900">{orderDetails.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">{orderDetails.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="text-lg font-semibold text-gray-900">{orderDetails.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date & Time</p>
                    <p className="text-lg font-semibold text-gray-900">{orderDetails.order_date}</p>
                  </div>
                </div>
              </div>

              {/* Product & Bill Summary */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">Order Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Product Name</p>
                    <p className="text-lg font-semibold text-gray-900">{orderDetails.product_name}</p>
                  </div>
                  {orderDetails.selected_size && (
                    <div>
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="text-lg font-semibold text-gray-900">{orderDetails.selected_size}</p>
                    </div>
                  )}
                  {orderDetails.selected_color && (
                    <div>
                      <p className="text-sm text-gray-500">Color</p>
                      <p className="text-lg font-semibold text-gray-900">{orderDetails.selected_color}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">{orderDetails.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unit Price</p>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(orderDetails.product_price)}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(orderDetails.amount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order ID with Animation */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl transform transition-all duration-300 hover:scale-[1.02] animate-pulse-slow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-xl font-bold text-gray-900">#{orderDetails.order_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-lg font-semibold text-green-600">Confirmed ✓</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Your order has been confirmed and will be processed shortly. You will receive updates on your phone.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons with Animation */}
          <div className="text-center animate-fade-in-up-delay-3">
            <button
              onClick={() => {
                setOrderPlaced(false);
                setOrderDetails(null);
                // Reset form
                setOrderForm({
                  customer_name: '',
                  customer_phone: '',
                  delivery_address: '',
                  quantity: 1,
                  selected_size: product?.size || '',
                  selected_color: product?.color || ''
                });
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white font-bold rounded-xl hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl animate-pulse-slow inline-flex items-center gap-3"
            >
              <svg className="w-6 h-6 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold">Order Placed Successfully!</p>
              <p className="text-sm opacity-90">Your order has been confirmed and will be processed soon.</p>
            </div>
          </div>
        </div>
      )}

      {/* Copy Success Popup */}
      {showCopySuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-semibold">URL Copied!</p>
              <p className="text-sm opacity-90">Product URL copied to clipboard</p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrCodeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Product QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <img src={qrCodeUrl} alt="Full QR Code" className="mx-auto w-64 h-64" />
              </div>
              <p className="text-sm text-gray-600 mb-6">Scan this QR code to view the product page on any device</p>
              <div className="flex space-x-3">
                <button
                  onClick={copyProductUrl}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy URL
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto py-4 md:py-8 px-3 md:px-4">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Product Image Section */}
            <div className="w-full md:w-2/5 p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="relative">
                <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                  {product.image && product.image.trim() ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center';
                          placeholder.innerHTML = `
                            <svg class="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          `;
                          parent.replaceChild(placeholder, e.currentTarget);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      <svg className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* QR Code Button */}
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    title="Show QR Code"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4M5 8l2-2m-2 8l2 2m8-8l2-2m-2 8l2 2" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Copy URL Button */}
              <div className="mt-6">
                <button
                  onClick={copyProductUrl}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Product URL
                </button>
              </div>
            </div>

            {/* Product Details and Order Form */}
            <div className="md:w-3/5 p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                <p className="text-gray-600 text-lg mb-6">{product.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Stock Available</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{product.stock_quantity}</p>
                  </div>
                </div>

                {/* Order Form */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Place Your Order</h3>
                  <form onSubmit={handleSubmitOrder}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="customer_name"
                          value={orderForm.customer_name}
                          onChange={handleOrderChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          name="customer_phone"
                          value={orderForm.customer_phone}
                          onChange={handleOrderChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    {/* Size and Color Selection */}
                    {(product.size || product.color) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {product.size && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                            <select
                              name="selected_size"
                              value={orderForm.selected_size}
                              onChange={handleOrderChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Size</option>
                              {product.size.split(',').map((sizeOption, index) => (
                                <option key={index} value={sizeOption.trim()}>
                                  {sizeOption.trim()}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {product.color && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <select
                              name="selected_color"
                              value={orderForm.selected_color}
                              onChange={handleOrderChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Color</option>
                              {product.color.split(',').map((colorOption, index) => (
                                <option key={index} value={colorOption.trim()}>
                                  {colorOption.trim()}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                      <textarea
                        name="delivery_address"
                        value={orderForm.delivery_address}
                        onChange={handleOrderChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        rows={3}
                        placeholder="Enter complete delivery address"
                      />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setOrderForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-lg font-semibold w-12 text-center">{orderForm.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setOrderForm(prev => ({ ...prev, quantity: Math.min(product.stock_quantity, prev.quantity + 1) }))}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price * orderForm.quantity)}</p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || orderForm.quantity > product.stock_quantity}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Place Order - ${formatPrice(product.price * orderForm.quantity)}`
                      )}
                    </button>
                    {orderForm.quantity > product.stock_quantity && (
                      <p className="text-red-600 text-sm mt-2 text-center">Not enough stock available</p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
