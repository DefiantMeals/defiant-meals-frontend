import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://defiant-meals-backend.onrender.com/api/menu';

const fetchMenuItems = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error(`Failed to fetch menu items: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

const addMenuItem = async (menuItem) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuItem),
  });
  if (!response.ok) throw new Error('Failed to add menu item');
  return await response.json();
};

const updateMenuItem = async (id, menuItem) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(menuItem),
  });
  if (!response.ok) throw new Error('Failed to update menu item');
  return await response.json();
};

const deleteMenuItem = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete menu item');
  return await response.json();
};

const toggleMenuItemAvailability = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to toggle menu item');
  return await response.json();
};

const Admin = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await fetchMenuItems();
      setMenuItems(items);
      setError(null);
    } catch (err) {
      setError(`Failed to load menu items: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, formData);
      } else {
        await addMenuItem({ ...formData, createdBy: 'admin' }); // ✅ Add createdBy
      }
      await loadMenuItems();
      resetForm();
      setError(null);
    } catch (err) {
      setError(editingItem ? 'Failed to update item' : 'Failed to add item');
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      available: item.available
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
        await loadMenuItems();
        setError(null);
      } catch (err) {
        setError('Failed to delete item');
        console.error(err);
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await toggleMenuItemAvailability(id);
      await loadMenuItems();
      setError(null);
    } catch (err) {
      setError('Failed to toggle availability');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      available: true
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading menu items...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Menu Administration</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(!showAddForm);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
            >
              {showAddForm ? 'Cancel' : 'Add New Item'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Available
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition duration-300"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition duration-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Current Menu Items</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr key={item._id || item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.description && <div className="text-sm text-gray-500">{item.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category || 'No category'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(item.price).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <button onClick={() => handleToggleAvailability(item._id || item.id)} className={`${
                        item.available ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                      }`}>
                        {item.available ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => handleDelete(item._id || item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {menuItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">No menu items found. Add your first item above!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
