





import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://defiant-meals-backend.onrender.com';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryDays, setSummaryDays] = useState(7);
  const [orderSummary, setOrderSummary] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });

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
    monday: { open: false, morningStart: '08:00', morningEnd: '12:00', eveningStart: '16:00', eveningEnd: '20:00' },
    tuesday: { open: false, morningStart: '08:00', morningEnd: '12:00', eveningStart: '16:00', eveningEnd: '20:00' },
    wednesday: { open: false, morningStart: '08:00', morningEnd: '12:00', eveningStart: '16:00', eveningEnd: '20:00' },
    thursday: { open: false, morningStart: '08:00', morningEnd: '12:00', eveningStart: '16:00', eveningEnd: '20:00' },
    friday: { open: false, morningStart: '08:00', morningEnd: '12:00', eveningStart: '16:00', eveningEnd: '20:00' },
    saturday: { open: false, morningStart: '08:00', morningEnd: '12:00', eveningStart: '16:00', eveningEnd: '20:00' },
    sunday: { open: false, morningStart: '08:00', morningEnd: '12:00', eveningStart: '16:00', eveningEnd: '20:00' }
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
      const url = activeTab === 'orders' 
        ? `${API_BASE_URL}/api/orders?date=${selectedDate}`
        : `${API_BASE_URL}/api/orders`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // Check for new orders and play sound
        if (!loading && data.length > lastOrderCount && activeTab === 'orders') {
          const newOrdersCount = data.length - lastOrderCount;
          if (newOrdersCount > 0) {
            playNewOrderSound();
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
        calculateStats(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const totalOrders = ordersData.length;
    const pendingOrders = ordersData.filter(order => 
      order.status === 'pending' || order.status === 'confirmed'
    ).length;
    const completedOrders = ordersData.filter(order => order.status === 'completed').length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);

    setStats({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
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
        calculateStats(orders);
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (orderId, hardDelete = false) => {
    if (!confirm(`Are you sure you want to ${hardDelete ? 'permanently delete' : 'cancel'} this order?`)) {
      return;
    }

    setDeleteLoading(prev => ({ ...prev, [orderId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: hardDelete ? 'DELETE' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: hardDelete ? undefined : JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        if (hardDelete) {
          setOrders(prev => prev.filter(order => order._id !== orderId));
        } else {
          setOrders(prev => prev.map(order => 
            order._id === orderId ? { ...order, status: 'cancelled' } : order
          ));
        }
        calculateStats(orders);
      } else {
        alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const generateOrderSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/summary?days=${summaryDays}`);
      if (response.ok) {
        const result = await response.json();
        setOrderSummary(result.data);
      } else {
        alert('Failed to generate order summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Error generating summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Menu functions
  const fetchMenuItems = async () => {
    setMenuLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`);
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
        ? `${API_BASE_URL}/api/menu/${editingItem._id}`
        : `${API_BASE_URL}/api/menu`;
      
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
        const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
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

  // Category functions
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
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
        ? `${API_BASE_URL}/api/categories/${editingCategory._id}`
        : `${API_BASE_URL}/api/categories`;
      
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
        const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
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

  // Schedule functions
  const fetchSchedule = async () => {
    setScheduleLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/schedule`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSchedule(data);
        }
      } else {
        console.log('Schedule endpoint not available, using default schedule');
      }
    } catch (error) {
      console.log('Schedule endpoint not available, using default schedule');
    } finally {
      setScheduleLoading(false);
    }
  };

  const updateSchedule = async (day, field, value) => {
    try {
      const updatedSchedule = {
        ...schedule,
        [day]: {
          ...schedule[day],
          [field]: value
        }
      };
      setSchedule(updatedSchedule);

      const response = await fetch(`${API_BASE_URL}/api/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSchedule)
      });

      if (!response.ok) {
        console.log('Schedule save failed - backend may not be ready');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
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
    if (activeTab === 'dashboard' || activeTab === 'orders') {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      fetchOrders();
      if (activeTab === 'orders') {
        startAutoRefresh();
        return () => stopAutoRefresh();
      }
    } else if (activeTab === 'menu') {
      fetchMenuItems();
      fetchCategories();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'schedule') {
      fetchSchedule();
    } else if (activeTab === 'summary') {
      fetchOrders();
    }
  }, [activeTab, selectedDate]);

  // Helper functions
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
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'cancelled': return 'Cancelled';
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
    const openDays = days.filter(day => schedule[day]?.open);
    
    if (openDays.length === 0) return 'Closed all week';
    
    return openDays.map(day => {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      return `${dayName}: ${schedule[day].morningStart}-${schedule[day].morningEnd}, ${schedule[day].eveningStart}-${schedule[day].eveningEnd}`;
    }).join(' | ');
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your restaurant management system</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order Management
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'menu'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Menu Management
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Category Management
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pickup Schedule
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order Summary
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.completedOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

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
                          <div><strong>Customer:</strong> {order.customerName || order.customer?.name || 'N/A'}</div>
                          <div><strong>Phone:</strong> {order.customerPhone || order.customer?.phone || 'N/A'}</div>
                          <div><strong>Email:</strong> {order.customerEmail || order.customer?.email || 'N/A'}</div>
                          <div><strong>Pickup Date:</strong> {order.pickupDate || new Date(order.createdAt).toLocaleDateString()}</div>
                          <div><strong>Pickup Time:</strong> {order.pickupTime || 'TBD'}</div>
                          <div><strong>Payment:</strong> {order.paymentMethod || 'Card'}</div>
                          <div><strong>Total:</strong> ${(order.totalAmount || order.total || 0).toFixed(2)}</div>
                          {order.customerNotes && (
                            <div><strong>Notes:</strong> {order.customerNotes}</div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-2">Items:</h4>
                        <div className="space-y-1 text-sm">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.quantity}x {item.menuItemId?.name || item.name || 'Unknown Item'}</span>
                              <span>${((item.menuItemId?.price || item.price || 0) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
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
                              Customer: ${order.customerName || order.customer?.name || 'N/A'}
                              Phone: ${order.customerPhone || order.customer?.phone || 'N/A'}
                              Pickup: ${order.pickupDate || 'TBD'} at ${order.pickupTime || 'TBD'}
                              
                              ITEMS:
                              ${order.items?.map(item => `${item.quantity}x ${item.menuItemId?.name || item.name || 'Unknown'} - $${((item.menuItemId?.price || item.price || 0) * item.quantity).toFixed(2)}`).join('\n')}
                              
                              TOTAL: $${(order.totalAmount || order.total || 0).toFixed(2)}
                              ${order.customerNotes ? `\nNOTES: ${order.customerNotes}` : ''}
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
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => deleteOrder(order._id, false)}
                            disabled={deleteLoading[order._id]}
                            className="flex-1 text-yellow-600 hover:text-yellow-900 disabled:opacity-50 py-1 px-2 text-sm border border-yellow-300 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteOrder(order._id, true)}
                            disabled={deleteLoading[order._id]}
                            className="flex-1 text-red-600 hover:text-red-900 disabled:opacity-50 py-1 px-2 text-sm border border-red-300 rounded"
                          >
                            {deleteLoading[order._id] ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
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
              <div className="bg-white rounded-lg shadow px-4 py-2 max-w-3xl">
                <p className="text-sm text-gray-600">Current schedule: {formatScheduleDisplay()}</p>
              </div>
            </div>

            {/* Schedule Management */}
            {scheduleLoading ? (
              <div className="text-center py-8">Loading schedule...</div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-6">Set Pickup Hours for Each Day</h3>
                <p className="text-gray-600 mb-6">Each day has two pickup windows: Morning and Evening</p>
                
                <div className="space-y-6">
                  {Object.entries(schedule)
                    .filter(([day]) => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day))
                    .map(([day, daySchedule]) => (
                    <div key={day} className="border rounded-lg p-6">
                      {/* Day header */}
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-medium text-gray-700 capitalize text-lg">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </h4>
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
                      
                      {/* Time slots */}
                      {daySchedule.open && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Morning Pickup */}
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-3">Morning Pickup</h5>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                  type="time"
                                  value={daySchedule.morningStart}
                                  onChange={(e) => updateSchedule(day, 'morningStart', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                  type="time"
                                  value={daySchedule.morningEnd}
                                  onChange={(e) => updateSchedule(day, 'morningEnd', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Evening Pickup */}
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h5 className="font-medium text-orange-900 mb-3">Evening Pickup</h5>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                  type="time"
                                  value={daySchedule.eveningStart}
                                  onChange={(e) => updateSchedule(day, 'eveningStart', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                  type="time"
                                  value={daySchedule.eveningEnd}
                                  onChange={(e) => updateSchedule(day, 'eveningEnd', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Preview available pickup times */}
                      {daySchedule.open && (
                        <div className="mt-6 pt-4 border-t">
                          <p className="text-sm text-gray-600 mb-3">Available pickup slots (30-min intervals):</p>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const slots = [];
                              
                              // Morning slots
                              const morningStart = new Date(`2000-01-01T${daySchedule.morningStart}`);
                              const morningEnd = new Date(`2000-01-01T${daySchedule.morningEnd}`);
                              const morningCurrent = new Date(morningStart);
                              
                              while (morningCurrent < morningEnd) {
                                slots.push({
                                  time: morningCurrent.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                  }),
                                  type: 'morning'
                                });
                                morningCurrent.setMinutes(morningCurrent.getMinutes() + 30);
                              }
                              
                              // Evening slots
                              const eveningStart = new Date(`2000-01-01T${daySchedule.eveningStart}`);
                              const eveningEnd = new Date(`2000-01-01T${daySchedule.eveningEnd}`);
                              const eveningCurrent = new Date(eveningStart);
                              
                              while (eveningCurrent < eveningEnd) {
                                slots.push({
                                  time: eveningCurrent.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                  }),
                                  type: 'evening'
                                });
                                eveningCurrent.setMinutes(eveningCurrent.getMinutes() + 30);
                              }
                              
                              return slots.slice(0, 12).map((slot, index) => (
                                <span 
                                  key={index} 
                                  className={`px-2 py-1 text-xs rounded ${
                                    slot.type === 'morning' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {slot.time}
                                </span>
                              ));
                            })()}
                            {(() => {
                              // Calculate total slots
                              const morningSlots = Math.floor(
                                (new Date(`2000-01-01T${daySchedule.morningEnd}`) - 
                                 new Date(`2000-01-01T${daySchedule.morningStart}`)) / (30 * 60 * 1000)
                              );
                              const eveningSlots = Math.floor(
                                (new Date(`2000-01-01T${daySchedule.eveningEnd}`) - 
                                 new Date(`2000-01-01T${daySchedule.eveningStart}`)) / (30 * 60 * 1000)
                              );
                              const totalSlots = morningSlots + eveningSlots;
                              
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
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Toggle days open/closed to control when customers can schedule pickups</li>
                    <li>• Each open day has two pickup windows: Morning and Evening</li>
                    <li>• Set custom start and end times for both windows</li>
                    <li>• Customers will see 30-minute pickup slots within your set hours</li>
                    <li>• Changes are saved automatically</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary Generator</h2>
              
              <div className="flex items-center space-x-4 mb-6">
                <label htmlFor="summaryDays" className="text-sm font-medium text-gray-700">
                  Generate summary for last:
                </label>
                <select
                  id="summaryDays"
                  value={summaryDays}
                  onChange={(e) => setSummaryDays(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
                <button
                  onClick={generateOrderSummary}
                  disabled={summaryLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {summaryLoading ? 'Generating...' : 'Generate Summary'}
                </button>
              </div>

              {orderSummary && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Summary for {orderSummary.dateRange.start} - {orderSummary.dateRange.end}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-900">{orderSummary.totalOrders}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-900">${orderSummary.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-purple-600 font-medium">Unique Items</p>
                      <p className="text-2xl font-bold text-purple-900">{orderSummary.items.length}</p>
                    </div>
                  </div>

                  <h4 className="text-md font-semibold mb-4">Items to Prepare</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Popular Add-ons</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orderSummary.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.flavor && (
                                <div className="text-sm text-blue-600">Flavor: {item.flavor}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${item.totalRevenue.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {item.addons.length > 0 ? item.addons.join(', ') : 'None'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;