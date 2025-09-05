import React, { useState, useEffect } from 'react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders');
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // Menu state
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'High Protein',
    calories: '',
    protein: '',
    available: true,
    imageUrl: ''
  });

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    available: true,
    sortOrder: 0
  });

  // Schedule state
  const [schedule, setSchedule] = useState({
    monday: { open: false, startTime: '08:00', endTime: '18:00' },
    tuesday: { open: false, startTime: '08:00', endTime: '18:00' },
    wednesday: { open: false, startTime: '08:00', endTime: '18:00' },
    thursday: { open: false, startTime: '08:00', endTime: '18:00' },
    friday: { open: false, startTime: '08:00', endTime: '18:00' },
    saturday: { open: false, startTime: '08:00', endTime: '18:00' },
    sunday: { open: false, startTime: '08:00', endTime: '18:00' }
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const defaultCategories = [
    'High Protein',
    'Quality Carbs', 
    'Healthier Options',
    'Snacks'
  ];

  // Audio notification function
  const playNewOrderSound = () => {
    if (audioEnabled) {
      // Create audio context and play notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  // Orders functions
  const fetchOrders = async () => {
    try {
      const response = await fetch(`https://defiant-meals-backend.onrender.com/api/orders?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        
        // Check for new orders and play sound
        if (!ordersLoading && data.length > lastOrderCount) {
          const newOrdersCount = data.length - lastOrderCount;
          if (newOrdersCount > 0) {
            playNewOrderSound();
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(`${newOrdersCount} New Order${newOrdersCount > 1 ? 's' : ''}!`, {
                body: 'Check the admin dashboard for details.',
                icon: '/favicon.ico'
              });
            }
          }
        }
        
        setOrders(data);
        setLastOrderCount(data.length);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`https://defiant-meals-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Menu functions
  const fetchMenuItems = async () => {
    setMenuLoading(true);
    try {
      const response = await fetch('https://defiant-meals-backend.onrender.com/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setMenuLoading(false);
    }
  };

  // Category functions
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('https://defiant-meals-backend.onrender.com/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Schedule functions
  const fetchSchedule = async () => {
    setScheduleLoading(true);
    try {
      const response = await fetch('https://defiant-meals-backend.onrender.com/api/schedule');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSchedule(data);
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setScheduleLoading(false);
    }
  };

  const updateSchedule = async (day, field, value) => {
    const updatedSchedule = {
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value
      }
    };
    setSchedule(updatedSchedule);

    try {
      const response = await fetch('https://defiant-meals-backend.onrender.com/api/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSchedule)
      });

      if (!response.ok) {
        console.error('Failed to update schedule');
        // Revert on error
        fetchSchedule();
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      // Revert on error
      fetchSchedule();
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory 
        ? `https://defiant-meals-backend.onrender.com/api/categories/${editingCategory._id}`
        : 'https://defiant-meals-backend.onrender.com/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...categoryFormData,
          sortOrder: parseInt(categoryFormData.sortOrder)
        })
      });

      if (response.ok) {
        fetchCategories();
        resetCategoryForm();
        setShowCategoryForm(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This may affect menu items using this category.')) {
      try {
        const response = await fetch(`https://defiant-meals-backend.onrender.com/api/categories/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchCategories();
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
      }
    }
  };

  const toggleCategoryAvailability = async (id, currentStatus) => {
    try {
      const response = await fetch(`https://defiant-meals-backend.onrender.com/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (response.ok) {
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category availability:', error);
      alert('Error updating category');
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      available: true,
      sortOrder: 0
    });
    setEditingCategory(null);
  };

  const startCategoryEdit = (category) => {
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      available: category.available,
      sortOrder: category.sortOrder || 0
    });
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem 
        ? `https://defiant-meals-backend.onrender.com/api/menu/${editingItem._id}`
        : 'https://defiant-meals-backend.onrender.com/api/menu';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      if (response.ok) {
        fetchMenuItems();
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const deleteMenuItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`https://defiant-meals-backend.onrender.com/api/menu/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchMenuItems();
        }
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      const response = await fetch(`https://defiant-meals-backend.onrender.com/api/menu/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'High Protein',
      calories: '',
      protein: '',
      available: true,
      imageUrl: ''
    });
    setEditingItem(null);
  };

  const startEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      calories: item.calories || '',
      protein: item.protein || '',
      available: item.available,
      imageUrl: item.imageUrl || ''
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  // Auto-refresh functions
  const startAutoRefresh = () => {
    if (refreshInterval) clearInterval(refreshInterval);
    const interval = setInterval(fetchOrders, 30000);
    setRefreshInterval(interval);
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      // Request notification permission on first load
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      fetchOrders();
      startAutoRefresh();
      return () => stopAutoRefresh();
    } else if (activeTab === 'menu') {
      fetchMenuItems();
      fetchCategories(); // Load categories for the dropdown
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'schedule') {
      fetchSchedule();
    }
  }, [activeTab, selectedDate]);

  // Helper functions for orders
  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return currentStatus;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'New Order';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  // Get available categories for menu form
  const availableCategories = [...new Set([
    ...defaultCategories,
    ...categories.filter(cat => cat.available).map(cat => cat.name)
  ])];

  // Helper function for schedule display
  const formatScheduleDisplay = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const openDays = days.filter(day => schedule[day].open);
    
    if (openDays.length === 0) return 'Closed all week';
    
    return openDays.map(day => {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      const start = schedule[day].startTime;
      const end = schedule[day].endTime;
      return `${dayName}: ${start} - ${end}`;
    }).join(', ');
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Restaurant Dashboard</h1>
          <p className="text-gray-600">Manage orders, menu items, categories, and pickup schedule</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-md font-semibold transition duration-300 ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Order Management
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-6 py-2 rounded-md font-semibold transition duration-300 ${
                activeTab === 'menu'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-2 rounded-md font-semibold transition duration-300 ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Category Management
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-2 rounded-md font-semibold transition duration-300 ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pickup Schedule
            </button>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-gray-800">{orderStats.total}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
                <div className="text-sm text-gray-600">New Orders</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{orderStats.preparing}</div>
                <div className="text-sm text-gray-600">Preparing</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{orderStats.ready}</div>
                <div className="text-sm text-gray-600">Ready</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">{orderStats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Orders</option>
                    <option value="confirmed">New Orders</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready for Pickup</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchOrders}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                  >
                    Refresh Orders
                  </button>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Auto-refresh:</span>
                    <div className={`w-3 h-3 rounded-full ${refreshInterval ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">{refreshInterval ? 'On' : 'Off'}</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`w-full py-2 px-4 rounded-md transition duration-300 ${
                      audioEnabled 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                    }`}
                  >
                    Sound: {audioEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500 text-lg">No orders found for the selected date and filter.</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div key={order._id} className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Order Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Order #{order._id?.slice(-8)}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div><strong>Customer:</strong> {order.customerName}</div>
                          <div><strong>Phone:</strong> {order.customerPhone}</div>
                          <div><strong>Email:</strong> {order.customerEmail}</div>
                          <div><strong>Pickup Date:</strong> {order.pickupDate}</div>
                          <div><strong>Pickup Time:</strong> {order.pickupTime}</div>
                          <div><strong>Payment:</strong> {order.paymentMethod || 'Card'}</div>
                          <div><strong>Total:</strong> ${order.totalAmount?.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-2">Items:</h4>
                        <div className="space-y-1 text-sm">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.quantity}x {item.menuItemId.name}</span>
                              <span>${(item.menuItemId.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        {order.status !== 'completed' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
                          >
                            {order.status === 'confirmed' && 'Start Preparing'}
                            {order.status === 'preparing' && 'Mark as Ready'}
                            {order.status === 'ready' && 'Mark as Complete'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            const printContent = `
                              ORDER #${order._id?.slice(-8)}
                              Customer: ${order.customerName}
                              Phone: ${order.customerPhone}
                              Pickup: ${order.pickupDate} at ${order.pickupTime}
                              
                              ITEMS:
                              ${order.items?.map(item => `${item.quantity}x ${item.menuItemId.name} - $${(item.menuItemId.price * item.quantity).toFixed(2)}`).join('\n')}
                              
                              TOTAL: $${order.totalAmount?.toFixed(2)}
                            `;
                            const printWindow = window.open('', '_blank');
                            printWindow.document.write(`<pre>${printContent}</pre>`);
                            printWindow.print();
                            printWindow.close();
                          }}
                          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300"
                        >
                          Print Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            {/* Menu Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Menu Items</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300"
              >
                Add New Item
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                    <input
                      type="text"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      placeholder="e.g., 320"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Protein</label>
                    <input
                      type="text"
                      name="protein"
                      value={formData.protein}
                      onChange={handleInputChange}
                      placeholder="e.g., 15g"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="available"
                        checked={formData.available}
                        onChange={handleInputChange}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Available for ordering</span>
                    </label>
                  </div>
                  
                  <div className="md:col-span-2 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        resetForm();
                      }}
                      className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Menu Items List */}
            {menuLoading ? (
              <div className="text-center py-8">Loading menu items...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item._id} className="bg-white rounded-lg shadow p-6">
                    {/* Image */}
                    {item.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Placeholder for items without images */}
                    {!item.imageUrl && (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">No Image</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <p className="text-xl font-bold text-blue-600 mb-2">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mb-4">{item.category}</p>
                    
                    {(item.calories || item.protein) && (
                      <div className="text-xs text-gray-500 mb-4">
                        {item.calories && <span>{item.calories} cal</span>}
                        {item.calories && item.protein && <span> • </span>}
                        {item.protein && <span>{item.protein} protein</span>}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="flex-1 bg-blue-600 text-white py-1 px-3 text-sm rounded hover:bg-blue-700 transition duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleAvailability(item._id, item.available)}
                        className={`flex-1 py-1 px-3 text-sm rounded transition duration-300 ${
                          item.available
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {item.available ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteMenuItem(item._id)}
                        className="flex-1 bg-red-600 text-white py-1 px-3 text-sm rounded hover:bg-red-700 transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            {/* Category Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Categories</h2>
              <button
                onClick={() => {
                  resetCategoryForm();
                  setShowCategoryForm(true);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300"
              >
                Add New Category
              </button>
            </div>

            {/* Add/Edit Category Form */}
            {showCategoryForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={categoryFormData.sortOrder}
                      onChange={handleCategoryInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={categoryFormData.description}
                      onChange={handleCategoryInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="available"
                        checked={categoryFormData.available}
                        onChange={handleCategoryInputChange}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Available for use</span>
                    </label>
                  </div>
                  
                  <div className="md:col-span-2 flex space-x-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                      {editingCategory ? 'Update Category' : 'Add Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        resetCategoryForm();
                      }}
                      className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            {categoriesLoading ? (
              <div className="text-center py-8">Loading categories...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <div key={category._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.available ? 'Available' : 'Disabled'}
                      </span>
                    </div>
                    
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-4">
                      Sort Order: {category.sortOrder || 0}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startCategoryEdit(category)}
                        className="flex-1 bg-blue-600 text-white py-1 px-3 text-sm rounded hover:bg-blue-700 transition duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleCategoryAvailability(category._id, category.available)}
                        className={`flex-1 py-1 px-3 text-sm rounded transition duration-300 ${
                          category.available
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {category.available ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteCategory(category._id)}
                        className="flex-1 bg-red-600 text-white py-1 px-3 text-sm rounded hover:bg-red-700 transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="md:col-span-3 bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-500 text-lg">No categories created yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Click "Add New Category" to get started.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            {/* Schedule Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Pickup Schedule</h2>
              <div className="bg-white rounded-lg shadow px-4 py-2 max-w-2xl">
                <p className="text-sm text-gray-600">Current schedule: {formatScheduleDisplay()}</p>
              </div>
            </div>

            {/* Schedule Management */}
            {scheduleLoading ? (
              <div className="text-center py-8">Loading schedule...</div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-6">Set Pickup Time Slots for Each Day</h3>
                
                <div className="space-y-6">
                  {Object.entries(schedule).map(([day, daySchedule]) => (
                    <div key={day} className="border rounded-lg p-6">
                      {/* Day header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <h4 className="font-medium text-gray-700 capitalize text-lg">{day}</h4>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={daySchedule.open}
                              onChange={(e) => updateSchedule(day, 'open', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {daySchedule.open ? 'Open' : 'Closed'}
                            </span>
                          </label>
                        </div>
                        
                        {daySchedule.open && (
                          <button
                            onClick={() => addTimeSlot(day)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 text-sm"
                          >
                            Add Time Slot
                          </button>
                        )}
                      </div>
                      
                      {/* Time slots */}
                      {daySchedule.open && (
                        <div className="space-y-3">
                          {daySchedule.timeSlots.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No time slots added yet. Click "Add Time Slot" to create pickup windows.</p>
                          ) : (
                            daySchedule.timeSlots.map((slot, index) => (
                              <div key={slot.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                                <div className="font-medium text-gray-700 min-w-0">
                                  Slot {index + 1}:
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <label className="text-sm font-medium text-gray-700">Start:</label>
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => updateTimeSlot(day, slot.id, 'startTime', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <label className="text-sm font-medium text-gray-700">End:</label>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => updateTimeSlot(day, slot.id, 'endTime', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                
                                <button
                                  onClick={() => removeTimeSlot(day, slot.id)}
                                  className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition duration-300 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))
                          )}
                          
                          {/* Preview available pickup times */}
                          {daySchedule.timeSlots.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm text-gray-600 mb-2">Available pickup slots (30-min intervals):</p>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  const allSlots = [];
                                  daySchedule.timeSlots.forEach(slot => {
                                    const start = new Date(`2000-01-01T${slot.startTime}`);
                                    const end = new Date(`2000-01-01T${slot.endTime}`);
                                    const current = new Date(start);
                                    
                                    while (current < end) {
                                      allSlots.push(current.toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true 
                                      }));
                                      current.setMinutes(current.getMinutes() + 30);
                                    }
                                  });
                                  
                                  // Remove duplicates and sort
                                  const uniqueSlots = [...new Set(allSlots)].sort((a, b) => {
                                    const timeA = new Date(`2000-01-01 ${a}`);
                                    const timeB = new Date(`2000-01-01 ${b}`);
                                    return timeA - timeB;
                                  });
                                  
                                  return uniqueSlots.slice(0, 12).map(slot => (
                                    <span key={slot} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {slot}
                                    </span>
                                  ));
                                })()}
                                {(() => {
                                  const totalSlots = daySchedule.timeSlots.reduce((total, slot) => {
                                    const start = new Date(`2000-01-01T${slot.startTime}`);
                                    const end = new Date(`2000-01-01T${slot.endTime}`);
                                    return total + Math.floor((end - start) / (30 * 60 * 1000));
                                  }, 0);
                                  return totalSlots > 12 ? (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                      +{totalSlots - 12} more
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Toggle days open/closed to control when customers can schedule pickups</li>
                    <li>• Add multiple time slots per day (e.g., morning, lunch, evening windows)</li>
                    <li>• Each time slot creates 30-minute pickup intervals for customers</li>
                    <li>• Remove time slots you no longer need</li>
                    <li>• Changes are saved automatically</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;