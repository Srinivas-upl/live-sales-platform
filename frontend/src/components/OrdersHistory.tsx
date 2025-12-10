import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import LoadingSpinner from './LoadingSpinner';

interface Order {
  id: number;
  product_id: number;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  image?: string;
}

const OrdersHistory: React.FC = () => {
  const { token } = useAuth() as any;
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export');
      return;
    }

    const headers = [
      'Order ID',
      'Product Name',
      'Customer Name',
      'Phone',
      'Delivery Address',
      'Amount (₹)',
      'Order Status',
      'Payment Status',
      'Date'
    ];

    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.id,
        `"${order.product_name}"`,
        `"${order.customer_name}"`,
        `"${order.customer_phone}"`,
        `"${order.delivery_address.replace(/"/g, '""')}"`,
        order.amount.toFixed(2),
        `"${order.order_status}"`,
        `"${order.payment_status}"`,
        new Date(order.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const markOrderAsComplete = async (orderId: number) => {
    if (!window.confirm('Mark this order as complete? This will move it to completed orders.')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_status: 'completed' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark order as complete');
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, order_status: 'completed' }
          : order
      ));
      
      alert('Order marked as complete!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const generateParcelLabel = (order: Order) => {
    // Enhanced label with better formatting for merchants
    const labelContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                         PARCEL LABEL - ORDER #${order.id.toString().padEnd(6)}                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  📦 SHIP TO:                                                                 ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  ${order.customer_name.padEnd(50)}  ║
║  ${order.delivery_address.substring(0, 50).padEnd(50)}  ║
║  ${order.delivery_address.length > 50 ? order.delivery_address.substring(50, 100).padEnd(50) : ''.padEnd(50)}  ║
║  📞 ${order.customer_phone.padEnd(47)}  ║
║                                                                              ║
║  🛒 PRODUCT DETAILS:                                                         ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  ${order.product_name.substring(0, 58).padEnd(58)}  ║
║  ₹ ${order.amount.toFixed(2).padEnd(55)}  ║
║                                                                              ║
║  📋 ORDER INFORMATION:                                                       ║
║  ──────────────────────────────────────────────────────────────────────────  ║
║  Status: ${order.order_status.padEnd(48)}  ║
║  Payment: ${order.payment_status.padEnd(46)}  ║
║  Date: ${new Date(order.created_at).toLocaleDateString().padEnd(49)}  ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                    🚚 HANDLE WITH CARE • FRAGILE ITEM                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Merchant: Live Sales Platform                                               ║
║  Generated: ${new Date().toLocaleString().padEnd(44)}  ║
║  Label ID: ${`LBL-${order.id}-${Date.now().toString().slice(-6)}`.padEnd(46)}  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `;

    const blob = new Blob([labelContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Parcel_Label_Order_${order.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success message
    alert(`Parcel label for Order #${order.id} downloaded successfully!`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.order_status.toLowerCase() === 'pending';
    if (filter === 'completed') return order.order_status.toLowerCase() === 'completed';
    return true;
  });

  // Count orders by status
  const pendingCount = orders.filter(o => o.order_status.toLowerCase() === 'pending').length;
  const completedCount = orders.filter(o => o.order_status.toLowerCase() === 'completed').length;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" style={{
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}>
        <div className="content-wrapper py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Orders History</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              View and manage all your customer orders in one place
            </p>
          </div>
        </div>
      </div>

      <div className="content-wrapper -mt-8 pb-16">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Merchant Order Management</h2>
              <p className="text-gray-600 mt-2">Track, package, and manage customer orders</p>
            </div>
            {orders.length > 0 && (
              <div className="flex space-x-3">
                <button
                  onClick={exportOrdersToCSV}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Orders
                </button>
              </div>
            )}
          </div>
          
          {/* Order Status Filter */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === 'completed'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg animate-fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h3>
            <p className="text-gray-600 text-lg mb-8">Your order history will appear here once customers start placing orders</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          {order.image && (
                            <img
                              src={order.image}
                              alt={order.product_name}
                              className="w-12 h-12 rounded-xl object-cover mr-4 border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDEwaDc3mswQ4o11aGVnSHJ5OGhkVXJzZmwyOWpYaEZsNHAzeGxMZzZaTVJFRiIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=';
                              }}
                            />
                          )}
                          <div>
                            <div className="text-base font-semibold text-gray-900">{order.product_name}</div>
                            <div className="text-sm text-gray-500">Order #{order.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">{order.customer_phone}</div>
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{order.delivery_address}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</div>
                        <div className="text-sm text-gray-500">{formatTime(order.created_at)}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900">{formatPrice(order.amount)}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                          {order.order_status}
                        </span>
                        <div className="text-xs text-gray-500 mt-2">
                          Payment: {order.payment_status}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex space-x-3">
                          {/* Generate Parcel Label Button - Enhanced */}
                          <button
                            onClick={() => generateParcelLabel(order)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                            title="Generate Parcel Label"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Label
                          </button>
                          
                          {/* Mark as Complete Button (only for pending orders) */}
                          {order.order_status.toLowerCase() === 'pending' && (
                            <button
                              onClick={() => markOrderAsComplete(order.id)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                              title="Mark Order as Complete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Complete
                            </button>
                          )}
                          
                          {/* View Details Button */}
                          <button
                            onClick={() => alert(`Order Details:\n\nCustomer: ${order.customer_name}\nProduct: ${order.product_name}\nAmount: ₹${order.amount}\nStatus: ${order.order_status}`)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                            title="View Order Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{formatPrice(orders.reduce((sum, order) => sum + order.amount, 0))}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {orders.length > 0 ? formatPrice(orders.reduce((sum, order) => sum + order.amount, 0) / orders.length) : formatPrice(0)}
            </div>
            <div className="text-sm text-gray-600">Average Order Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersHistory;
