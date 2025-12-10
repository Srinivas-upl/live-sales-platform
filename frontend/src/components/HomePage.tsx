import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth() as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Flipkart Inspired */}
      <div className="bg-flipkart-gradient">
        <div className="content-wrapper py-8 md:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-8 lg:mb-0 lg:w-1/2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
                Sell Live Like a
                <span className="text-[#ff9f00]"> Pro</span>
                <br />
                <span className="text-2xl md:text-3xl lg:text-4xl">With LiveShop.in</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl leading-relaxed">
                Create stunning product pages, generate QR codes, and track orders in real-time. 
                Everything you need for successful live sales, all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/register"
                      className="px-8 py-4 bg-white text-[#2874f0] font-semibold rounded-sm hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Start Selling Free
                    </Link>
                    <Link
                      to="/login"
                      className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-sm hover:bg-white/10 transition-all duration-200"
                    >
                      Sign In to Dashboard
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 bg-[#ff9f00] text-white font-semibold rounded-sm hover:bg-[#e68a00] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Go to Your Dashboard
                  </Link>
                )}
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-blue-200 text-sm">Merchants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">₹50M+</div>
                  <div className="text-blue-200 text-sm">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">100K+</div>
                  <div className="text-blue-200 text-sm">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-blue-200 text-sm">Support</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-sm shadow-2xl overflow-hidden border border-gray-200 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-gray-900 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#2874f0] rounded-sm flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                      </div>
                      <span className="text-white font-semibold">LiveShop Dashboard</span>
                    </div>
                    <div className="text-gray-400 text-sm">Live Preview</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-sm border border-blue-100">
                      <div className="text-2xl font-bold text-[#2874f0]">12</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-sm border border-green-100">
                      <div className="text-2xl font-bold text-[#26a541]">₹2.4K</div>
                      <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-sm border border-purple-100">
                      <div className="text-2xl font-bold text-[#8b5cf6]">48</div>
                      <div className="text-sm text-gray-600">Orders</div>
                    </div>
                  </div>
                  
                  {/* Product Preview */}
                  <div className="bg-gray-50 rounded-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">Wireless Headphones</span>
                      <span className="text-[#26a541] font-bold">₹1,299</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-sm flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600 truncate">live.shop.in/product/xyz123</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-[#26a541] text-white px-2 py-1 rounded-sm">24% OFF</span>
                              <span className="text-xs text-gray-500 line-through">₹1,699</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Sell Live
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern merchants and live sales professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M6.01 18.704C5.272 18.074 4 16.678 4 14.528c0-4.901 3.44-10.567 7.103-12.6a.375.375 0 01.394 0c3.662 1.934 7.103 7.6 7.103 12.6 0 2.15-1.272 3.546-2.01 4.176M6.105 18.704l2.22-2.22m4.532 0l2.22 2.22M12 12V7.88" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">QR Code Generation</h3>
              <p className="text-gray-600">Create high-quality QR codes instantly. Perfect for live demonstrations and printed materials.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shareable Links</h3>
              <p className="text-gray-600">Generate clean, optimized URLs for every product. Track clicks and conversions with built-in analytics.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Analytics</h3>
              <p className="text-gray-600">Monitor sales performance, customer behavior, and revenue trends with detailed insights.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inventory Management</h3>
              <p className="text-gray-600">Track stock levels, automate alerts, and manage products with advanced inventory controls.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Processing</h3>
              <p className="text-gray-600">Handle orders efficiently with automated processing, status tracking, and customer communication.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600">Multiple payment options with bank-grade security and fraud protection for safe transactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Sales?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of merchants who have already upgraded their live sales experience.
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              Start Your Free Trial Today
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              Go to Your Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
