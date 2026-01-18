import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://defiant-meals-backend.onrender.com';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [grabAndGoOrders, setGrabAndGoOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);

  // Form states for menu items
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    protein: '',
    carbs: '',
    fats: '',
    calories: '',
    servingSize: '',
    available: true,
    imageUrl: '',
    flavorOptions: [],
    addonOptions: [],
    showOnPreOrder: true,
    isGrabAndGo: false,
    inventory: 0,
    isFood: true // Default to food item
  });

  // Categories list for dropdown
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Date filter for orders
  const [selectedDate, setSelectedDate] = useState('');

  // Shopping list date range
  const [shoppingListStartDate, setShoppingListStartDate] = useState('');
  const [shoppingListEndDate, setShoppingListEndDate] = useState('');

  // Form states for categories
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    available: true,
    sortOrder: 0
  });

  // Flavor and addon temporary states
  const [newFlavor, setNewFlavor] = useState({ name: '', price: 0 });
  const [newAddon, setNewAddon] = useState({ name: '', price: 0, protein: '', carbs: '', fats: '', calories: '' });

  // Fetch category options for dropdown
  const fetchCategoryOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      setCategoryOptions(data.filter(cat => cat.available));
    } catch (error) {
      console.error('Error fetching category options:', error);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchCategoryOptions(); // Always fetch categories for dropdown
    if (activeTab === 'menu') {
      fetchMenuItems();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'grab-and-go') {
      fetchGrabAndGoOrders();
      fetchMenuItems(); // Also fetch menu items to show Grab & Go items
    }
  }, [activeTab]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`);
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrabAndGoOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/grab-and-go/orders`);
      const data = await response.json();
      setGrabAndGoOrders(data);
    } catch (error) {
      console.error('Error fetching Grab & Go orders:', error);
      alert('Failed to load Grab & Go orders');
    } finally {
      setLoading(false);
    }
  };

  // Menu Item Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `${API_BASE_URL}/api/menu/${editingItem._id}`
        : `${API_BASE_URL}/api/menu`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
        fetchMenuItems();
        resetForm();
      } else {
        alert('Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      protein: item.protein || '',
      carbs: item.carbs || '',
      fats: item.fats || '',
      calories: item.calories || '',
      servingSize: item.servingSize || '',
      available: item.available,
      imageUrl: item.imageUrl || '',
      flavorOptions: item.flavorOptions || [],
      addonOptions: item.addonOptions || [],
      showOnPreOrder: item.showOnPreOrder !== false,
      isGrabAndGo: item.isGrabAndGo || false,
      inventory: item.inventory || 0,
      isFood: item.isFood !== undefined ? item.isFood : true // Handle existing items without isFood field
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Item deleted successfully!');
        fetchMenuItems();
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      protein: '',
      carbs: '',
      fats: '',
      calories: '',
      servingSize: '',
      available: true,
      imageUrl: '',
      flavorOptions: [],
      addonOptions: [],
      showOnPreOrder: true,
      isGrabAndGo: false,
      inventory: 0,
      isFood: true
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  // Category Handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `${API_BASE_URL}/api/categories/${editingCategory._id}`
        : `${API_BASE_URL}/api/categories`;
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData)
      });

      if (response.ok) {
        alert(editingCategory ? 'Category updated successfully!' : 'Category added successfully!');
        fetchCategories();
        resetCategoryForm();
      } else {
        alert('Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      available: category.available,
      sortOrder: category.sortOrder || 0
    });
    setShowAddCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Category deleted successfully!');
        fetchCategories();
      } else {
        alert('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
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
    setShowAddCategoryForm(false);
  };

  // Flavor and Addon Handlers
  const addFlavor = () => {
    if (newFlavor.name.trim()) {
      setFormData({
        ...formData,
        flavorOptions: [...formData.flavorOptions, { ...newFlavor, price: parseFloat(newFlavor.price) || 0 }]
      });
      setNewFlavor({ name: '', price: 0 });
    }
  };

  const removeFlavor = (index) => {
    setFormData({
      ...formData,
      flavorOptions: formData.flavorOptions.filter((_, i) => i !== index)
    });
  };

  const addAddon = () => {
    if (newAddon.name.trim()) {
      setFormData({
        ...formData,
        addonOptions: [...formData.addonOptions, {
          name: newAddon.name,
          price: parseFloat(newAddon.price) || 0,
          protein: newAddon.protein || '',
          carbs: newAddon.carbs || '',
          fats: newAddon.fats || '',
          calories: newAddon.calories || ''
        }]
      });
      setNewAddon({ name: '', price: 0, protein: '', carbs: '', fats: '', calories: '' });
    }
  };

  const removeAddon = (index) => {
    setFormData({
      ...formData,
      addonOptions: formData.addonOptions.filter((_, i) => i !== index)
    });
  };

  // Order Status Handler
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Order status updated!');
        fetchOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  // Grab & Go Order Status Handler
  const updateGrabAndGoOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grab-and-go/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Grab & Go order status updated!');
        fetchGrabAndGoOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating Grab & Go order status:', error);
      alert('Error updating order status');
    }
  };

  // Update inventory for Grab & Go items
  const updateInventory = async (itemId, newInventory) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: parseInt(newInventory) })
      });

      if (response.ok) {
        alert('Inventory updated!');
        fetchMenuItems();
      } else {
        alert('Failed to update inventory');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Error updating inventory');
    }
  };

  // Toggle availability for pre-orders and grab & go
  const handleAvailabilityToggle = async (itemId, field, value) => {
    try {
      await fetch(`${API_BASE_URL}/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  return (
    <>
      {window.scrollY > 300 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 text-2xl"
        >
          ↑
        </button>
      )}
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'menu'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('grab-and-go')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'grab-and-go'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-green-50'
            }`}
          >
            Grab & Go
          </button>
        </div>

        {/* Menu Items Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                {showAddForm ? 'Cancel' : '+ Add New Item'}
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        required
                      >
                        <option value="">Select a category</option>
                        {categoryOptions.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image URL</label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Nutritional Information */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Protein (g)</label>
                      <input
                        type="text"
                        value={formData.protein}
                        onChange={(e) => setFormData({...formData, protein: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                      <input
                        type="text"
                        value={formData.carbs}
                        onChange={(e) => setFormData({...formData, carbs: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Fats (g)</label>
                      <input
                        type="text"
                        value={formData.fats}
                        onChange={(e) => setFormData({...formData, fats: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Calories</label>
                      <input
                        type="text"
                        value={formData.calories}
                        onChange={(e) => setFormData({...formData, calories: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Serving Size</label>
                      <input
                        type="text"
                        value={formData.servingSize}
                        onChange={(e) => setFormData({...formData, servingSize: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                        placeholder="e.g., 8 oz"
                      />
                    </div>
                  </div>

                  {/* Tax Classification Section */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium mb-2">Tax Classification *</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="isFood"
                          checked={formData.isFood === true}
                          onChange={() => setFormData({...formData, isFood: true})}
                          className="w-4 h-4 text-blue-600"
                          required
                        />
                        <span className="text-sm">
                          <span className="font-semibold">Food Item (3% tax)</span>
                          <span className="text-gray-500 ml-2">- Meals, meal prep items, snacks</span>
                        </span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="isFood"
                          checked={formData.isFood === false}
                          onChange={() => setFormData({...formData, isFood: false})}
                          className="w-4 h-4 text-blue-600"
                          required
                        />
                        <span className="text-sm">
                          <span className="font-semibold">Non-Food/Drink (9.5% tax)</span>
                          <span className="text-gray-500 ml-2">- Beverages, drinks, supplements</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Menu Display Controls */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Menu Display Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.showOnPreOrder !== false}
                          onChange={(e) => setFormData({...formData, showOnPreOrder: e.target.checked})}
                          className="rounded"
                        />
                        <span className="font-medium">Show on Pre-Order Menu</span>
                        <span className="text-sm text-gray-500">(Main menu for scheduled orders)</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.isGrabAndGo}
                          onChange={(e) => setFormData({...formData, isGrabAndGo: e.target.checked})}
                          className="rounded"
                        />
                        <span className="font-medium">Show on Grab & Go Menu</span>
                        <span className="text-sm text-gray-500">(QR code instant purchase)</span>
                      </label>
                    </div>
                    
                    {formData.isGrabAndGo && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Inventory Count</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.inventory}
                          onChange={(e) => setFormData({...formData, inventory: parseInt(e.target.value) || 0})}
                          className="w-full p-2 border rounded-lg"
                          placeholder="Number of items available"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Set how many of this item are currently available for Grab & Go purchase
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Flavor Options */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Flavor Options</h4>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Flavor name"
                        value={newFlavor.name}
                        onChange={(e) => setNewFlavor({...newFlavor, name: e.target.value})}
                        className="flex-1 p-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Extra cost"
                        value={newFlavor.price}
                        onChange={(e) => setNewFlavor({...newFlavor, price: e.target.value})}
                        className="w-32 p-2 border rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={addFlavor}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1">
                      {formData.flavorOptions.map((flavor, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span>{flavor.name} {flavor.price > 0 && `(+$${(parseFloat(flavor.price) || 0).toFixed(2)})`}</span>
                          <button
                            type="button"
                            onClick={() => removeFlavor(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add-on Options */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Add-on Options</h4>
                    <div className="space-y-2 mb-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add-on name"
                          value={newAddon.name}
                          onChange={(e) => setNewAddon({...newAddon, name: e.target.value})}
                          className="flex-1 p-2 border rounded-lg"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Extra cost"
                          value={newAddon.price}
                          onChange={(e) => setNewAddon({...newAddon, price: e.target.value})}
                          className="w-32 p-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Protein (e.g. 25g)"
                          value={newAddon.protein}
                          onChange={(e) => setNewAddon({...newAddon, protein: e.target.value})}
                          className="flex-1 p-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Carbs (e.g. 10g)"
                          value={newAddon.carbs}
                          onChange={(e) => setNewAddon({...newAddon, carbs: e.target.value})}
                          className="flex-1 p-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Fats (e.g. 5g)"
                          value={newAddon.fats}
                          onChange={(e) => setNewAddon({...newAddon, fats: e.target.value})}
                          className="flex-1 p-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Calories"
                          value={newAddon.calories}
                          onChange={(e) => setNewAddon({...newAddon, calories: e.target.value})}
                          className="w-24 p-2 border rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={addAddon}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {formData.addonOptions.map((addon, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium">{addon.name} (+${(parseFloat(addon.price) || 0).toFixed(2)})</span>
                            {(addon.protein || addon.carbs || addon.fats || addon.calories) && (
                              <span className="text-sm text-gray-500 ml-2">
                                {[
                                  addon.protein && `${addon.protein} P`,
                                  addon.carbs && `${addon.carbs} C`,
                                  addon.fats && `${addon.fats} F`,
                                  addon.calories && `${addon.calories} cal`
                                ].filter(Boolean).join(' | ')}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAddon(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                      className="mr-2"
                    />
                    <label>Available for ordering</label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Menu Items List */}
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (() => {
              const sortedMenuItems = [...menuItems].sort((a, b) => a.name.localeCompare(b.name));
              return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedMenuItems.map(item => (
                  <div key={item._id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex gap-4 mb-3 p-2 bg-gray-50 rounded">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.availableForPreorders}
                          onChange={(e) => handleAvailabilityToggle(item._id, 'availableForPreorders', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Pre-orders</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.availableForGrabAndGo}
                          onChange={(e) => handleAvailabilityToggle(item._id, 'availableForGrabAndGo', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span className="text-sm font-medium">Grab & Go</span>
                      </label>
                    </div>
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-t-lg mb-3"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        {item.isGrabAndGo && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                            Grab & Go
                          </span>
                        )}
                        {item.isFood !== undefined && (
                          <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ml-1 ${
                            item.isFood ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {item.isFood ? '3% tax' : '9.5% tax'}
                          </span>
                        )}
                      </div>
                      <span className="text-xl font-bold text-blue-600">${(parseFloat(item.price) || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{item.description}</p>
                    {item.isGrabAndGo && (
                      <p className="text-sm text-gray-600 mb-3">
                        Inventory: <span className="font-semibold">{item.inventory || 0}</span> available
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Category Management</h2>
              <button
                onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                {showAddCategoryForm ? 'Cancel' : '+ Add New Category'}
              </button>
            </div>

            {/* Add/Edit Category Form */}
            {showAddCategoryForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={categoryFormData.sortOrder}
                      onChange={(e) => setCategoryFormData({...categoryFormData, sortOrder: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categoryFormData.available}
                      onChange={(e) => setCategoryFormData({...categoryFormData, available: e.target.checked})}
                      className="mr-2"
                    />
                    <label>Available</label>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      {editingCategory ? 'Update Category' : 'Add Category'}
                    </button>
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category._id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Sort Order: {category.sortOrder}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        category.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.available ? 'Available' : 'Hidden'}
                      </span>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
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

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Order Management</h2>

            {/* Date Filter */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Filter by Pickup Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-2 border rounded-lg"
                  />
                </div>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="mt-6 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Meal Prep Totals Card */}
            {!loading && orders.length > 0 && (() => {
              // Filter orders by selected date if set
              const filteredOrders = selectedDate
                ? orders.filter(order => {
                    const orderDate = new Date(order.pickupDate).toISOString().split('T')[0];
                    return orderDate === selectedDate;
                  })
                : orders;

              const mealTotals = {};
              filteredOrders.forEach(order => {
                order.items?.forEach(item => {
                  const name = item.name || item.menuItemId?.name;
                  if (name) {
                    mealTotals[name] = (mealTotals[name] || 0) + item.quantity;
                  }
                });
              });
              const sortedTotals = Object.entries(mealTotals).sort((a, b) => b[1] - a[1]);

              const exportToCSV = () => {
                const csvContent = "Menu Item,Quantity\n" +
                  sortedTotals.map(([name, qty]) => `"${name}",${qty}`).join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                const dateStr = selectedDate || new Date().toISOString().split('T')[0];
                link.download = `meal-prep-totals-${dateStr}.csv`;
                link.click();
              };

              const downloadShoppingList = () => {
                // Filter orders by shopping list date range
                const shoppingListOrders = orders.filter(order => {
                  const orderDate = new Date(order.pickupDate).toISOString().split('T')[0];
                  if (shoppingListStartDate && shoppingListEndDate) {
                    return orderDate >= shoppingListStartDate && orderDate <= shoppingListEndDate;
                  } else if (shoppingListStartDate) {
                    return orderDate >= shoppingListStartDate;
                  } else if (shoppingListEndDate) {
                    return orderDate <= shoppingListEndDate;
                  }
                  return true;
                });

                // Aggregate meal totals for the date range
                const shoppingMealTotals = {};
                shoppingListOrders.forEach(order => {
                  order.items?.forEach(item => {
                    const name = item.name || item.menuItemId?.name;
                    if (name) {
                      shoppingMealTotals[name] = (shoppingMealTotals[name] || 0) + item.quantity;
                    }
                  });
                });
                const shoppingTotals = Object.entries(shoppingMealTotals).sort((a, b) => b[1] - a[1]);

                const shoppingItems = shoppingTotals.map(([name, qty]) => ({
                  item: name,
                  quantity: qty,
                  portions: qty
                }));

                const csvContent = "Item,Quantity Needed,Portions to Prepare\n" +
                  shoppingItems.map(item => `"${item.item}",${item.quantity},${item.portions}`).join("\n");
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                const dateStr = shoppingListStartDate && shoppingListEndDate
                  ? `${shoppingListStartDate}-to-${shoppingListEndDate}`
                  : shoppingListStartDate || shoppingListEndDate || new Date().toISOString().split('T')[0];
                link.download = `shopping-list-${dateStr}.csv`;
                link.click();
              };

              return (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold">
                      Meal Prep Totals
                      {selectedDate && (
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          (for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()})
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={exportToCSV}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                    >
                      Export Totals to CSV
                    </button>
                  </div>

                  {/* Shopping List Date Range */}
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">Shopping List Date Range</h4>
                    <div className="flex gap-4 items-center mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                          type="date"
                          value={shoppingListStartDate}
                          onChange={(e) => setShoppingListStartDate(e.target.value)}
                          className="border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                          type="date"
                          value={shoppingListEndDate}
                          onChange={(e) => setShoppingListEndDate(e.target.value)}
                          className="border rounded px-3 py-2"
                        />
                      </div>
                      <button
                        onClick={downloadShoppingList}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all mt-5"
                      >
                        Download Shopping List
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Menu Item</th>
                          <th className="text-right py-2 px-4">Total Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedTotals.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="text-center py-4 text-gray-500">
                              No orders for this date
                            </td>
                          </tr>
                        ) : (
                          sortedTotals.map(([name, quantity]) => (
                            <tr key={name} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-4">{name}</td>
                              <td className="text-right py-2 px-4 font-semibold">{quantity}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Totals based on {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                    {selectedDate && ` for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString()}`}
                  </p>
                </div>
              );
            })()}

            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-500">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders
                  .filter(order => {
                    if (!selectedDate) return true;
                    const orderDate = new Date(order.pickupDate).toISOString().split('T')[0];
                    return orderDate === selectedDate;
                  })
                  .map(order => (
                  <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{order.customerName}</h3>
                        <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        <p className="text-sm text-gray-600">{order.customerPhone}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Pickup: {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">${(parseFloat(order.totalAmount) || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mb-4">
                      <h4 className="font-semibold mb-2">Items:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm text-gray-700 mb-1">
                          <span>
                            {item.quantity}x {item.name}
                            {item.selectedFlavor?.name && ` (${item.selectedFlavor.name})`}
                            {item.selectedAddons?.length > 0 && ` + ${item.selectedAddons.map(a => a.name).join(', ')}`}
                          </span>
                          <span className="ml-2">- ${(parseFloat(item.price) || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.customerNotes && (
                      <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                        <p className="font-bold text-yellow-800 text-sm uppercase tracking-wide">Special Instructions:</p>
                        <p className="text-yellow-900 mt-1">{order.customerNotes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grab & Go Tab */}
        {activeTab === 'grab-and-go' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Grab & Go Management</h2>
            
            {/* Grab & Go Inventory Management */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-xl font-bold mb-4">Inventory Management</h3>
              <div className="space-y-4">
                {menuItems.filter(item => item.isGrabAndGo).length === 0 ? (
                  <p className="text-gray-500">No items marked as Grab & Go. Add items from the Menu Items tab.</p>
                ) : (
                  menuItems
                    .filter(item => item.isGrabAndGo)
                    .map(item => (
                      <div key={item._id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">${(parseFloat(item.price) || 0).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateInventory(item._id, Math.max(0, (item.inventory || 0) - 1))}
                              className="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={item.inventory || 0}
                              onChange={(e) => updateInventory(item._id, e.target.value)}
                              className="w-20 text-center p-2 border rounded-lg"
                            />
                            <button
                              onClick={() => updateInventory(item._id, (item.inventory || 0) + 1)}
                              className="w-8 h-8 rounded-full bg-green-500 text-white hover:bg-green-600 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm text-gray-600 w-24">
                            {item.inventory > 0 ? `${item.inventory} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Grab & Go Orders */}
            <div>
              <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
              {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : grabAndGoOrders.length === 0 ? (
                <p className="text-center text-gray-500">No Grab & Go orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {grabAndGoOrders.map(order => (
                    <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold">Order #{order._id.slice(-6)}</h4>
                          <h4 className="text-lg font-bold">{order.customerName || 'Guest'}</h4>
                          <p className="text-sm text-gray-600">{order.customerEmail || 'No email'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${(parseFloat(order.totalAmount) || 0).toFixed(2)}
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-4 mb-4">
                        <h5 className="font-semibold mb-2">Items:</h5>
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-700 mb-1">
                            <span>
                              {item.quantity}x {item.name}
                              {item.selectedFlavor?.name && ` (${item.selectedFlavor.name})`}
                              {item.selectedAddons?.length > 0 && ` + ${item.selectedAddons.map(a => a.name).join(', ')}`}
                            </span>
                            <span className="ml-2">- ${(parseFloat(item.price) || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateGrabAndGoOrderStatus(order._id, 'completed')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            Mark as Completed
                          </button>
                          <button
                            onClick={() => updateGrabAndGoOrderStatus(order._id, 'cancelled')}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Admin;